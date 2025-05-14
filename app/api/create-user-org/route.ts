import { NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // apiVersion: '2023-10-16',
});

export async function POST(req: Request) {
  const { sessionId } = await req.json();

  if (!sessionId) {
    return NextResponse.json({ error: 'Session ID manquante' }, { status: 400 });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
      return NextResponse.json({ error: 'Session Stripe non trouvée' }, { status: 400 });
    }

    if (!session.customer_email) {
      return NextResponse.json({ error: 'Email utilisateur manquant dans la session Stripe' }, { status: 400 });
    }

    const metadata = session.metadata;
    if (!metadata) {
      return NextResponse.json({ error: 'Les métadonnées de la session Stripe sont manquantes' }, { status: 400 });
    }

    // 1. Créer l'utilisateur sans organisation_id (sera mis à jour ensuite)
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert([
        {
          email: session.customer_email,
          first_name: metadata.first_name || '',
          last_name: metadata.last_name || '',
          avatar_url: metadata.avatar_url || null,
          role: 'admin',
          position: metadata.position || 'Fondateur',
        },
      ])
      .select()
      .single();

    if (userError || !userData) {
      throw new Error(`Erreur création utilisateur: ${userError?.message}`);
    }

    // 2. Créer l'organisation en associant l'utilisateur
    const { data: orgData, error: orgError } = await supabase
      .from('organizations')
      .insert([
        {
          slug: metadata.slug || 'default-slug',
          name: metadata.organization_name || 'Nom par défaut',
          logo_url: metadata.logo_url || null,
          website: metadata.website || null,
          address: metadata.address || null,
          country: metadata.country || null,
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: session.subscription as string,
        },
      ])
      .select()
      .single();

    if (orgError || !orgData) {
      throw new Error(`Erreur création organisation: ${orgError?.message}`);
    }

    // 3. Mise à jour de l'utilisateur avec l'organisation_id
    const { error: updateError } = await supabase
      .from('users')
      .update({ organization_id: orgData.id })
      .eq('id', userData.id);

    if (updateError) {
      throw new Error(`Erreur mise à jour user avec organisation: ${updateError.message}`);
    }

    return NextResponse.json({ message: 'Utilisateur et organisation créés avec succès' }, { status: 200 });
  } catch (error: any) {
    console.error('Erreur lors de la création:', error);
    return NextResponse.json({ error: error.message || 'Erreur serveur' }, { status: 500 });
  }
}
