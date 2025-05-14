'use client'

import { useState, useTransition } from 'react'
import { createCheckoutSession } from '@/app/action/stripAction'

export function Checkout({ articles }: { articles: any[] }) {
  const [loading, setLoading] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleCheckout = async () => {
    setLoading(true)
    startTransition(async () => {
      try {
        const session = await createCheckoutSession(articles)
        if (session?.url) {
          window.location.href = session.url
        } else {
          console.error("Session URL is undefined")
        }
      } catch (error) {
        console.error("Error during checkout:", error)
      } finally {
        setLoading(false)
      }
    })
  }

  return (
    <div className="flex flex-col items-center justify-center mt-6">
      <button
        onClick={handleCheckout}
        disabled={loading || isPending}
        className={`bg-blue-500 text-white font-bold py-2 px-4 rounded ${
          loading || isPending ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isPending || loading ? 'Processing...' : 'Payer'}
      </button>
    </div>
  )
}
