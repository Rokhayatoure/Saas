'use server'

import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
//    apiVersion: "2025-12-05", // Tu peux adapter à la version que tu veux utiliser
  typescript: true,
})

export async function createCheckoutSession(articles: Stripe.Checkout.SessionCreateParams.LineItem[]) {
  try {
    const session = await stripe.checkout.sessions.create({
   mode: "subscription", // ✅ Changer ici
      payment_method_types: ["card"],
      line_items: articles,   
      
      success_url: 'http://localhost:3000/create-account?session_id={CHECKOUT_SESSION_ID}', // ✅ redirection ici
      cancel_url: 'http://localhost:3000/',
    })

    return session
  } catch (error) {
    console.error("Error creating checkout session:", error)
    throw new Error("Failed to create checkout session")
  }
}