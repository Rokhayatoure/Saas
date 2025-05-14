'use server'

import { supabase } from '../lib/supabase' 
import { v4 as uuidv4 } from 'uuid';

type CreateUserAndOrgParams = {
  email: string
  first_name: string
  last_name: string
  stripeSessionId: string
}

export async function createUserAndOrganization({
  email,
  first_name,
  last_name,
  stripeSessionId,
}: CreateUserAndOrgParams) {
  try {
    // 1. Créer une organisation
    const orgId = uuidv4() // ou utilise `crypto.randomUUID()`
    const slug = `${first_name.toLowerCase()}-${last_name.toLowerCase()}-${Date.now()}`

    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .insert([
        {
          id: orgId,
          name: `${first_name} ${last_name} Org`,
          slug,
          stripe_customer_id: null,
          stripe_subscription_id: null,
          logo_url: null,
          website: null,
          address: null,
          country: null,
        },
      ])
      .select()
      .single()

    if (orgError) throw orgError

    // 2. Créer un utilisateur lié à cette organisation
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert([
        {
          email,
          first_name,
          last_name,
          avatar_url: null,
          role: 'admin',
          position: 'Fondateur',
          organization_id: org.id,
        },
      ])
      .select()
      .single()

    if (userError) throw userError

    return { user, organization: org }
  } catch (error) {
    console.error('Erreur Supabase :', error)
    throw new Error('Création utilisateur/organisation échouée')
  }
}
