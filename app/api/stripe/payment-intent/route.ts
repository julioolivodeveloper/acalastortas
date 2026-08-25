import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const { amount } = await req.json() // amount in cents

  const { data } = await supabaseAdmin
    .from('app_settings')
    .select('value')
    .eq('key', 'stripe_secret_key')
    .single()

  if (!data?.value) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 400 })
  }

  const stripe = new Stripe(data.value)
  const intent = await stripe.paymentIntents.create({
    amount,
    currency: 'usd',
    automatic_payment_methods: { enabled: true },
  })

  return NextResponse.json({ clientSecret: intent.client_secret })
}
