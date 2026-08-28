import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  const { amount } = await req.json()

  // amount must be a positive integer in cents, minimum $1.00
  if (!Number.isInteger(amount) || amount < 100) {
    return NextResponse.json({ error: 'Monto inválido' }, { status: 400 })
  }
  // Sanity cap: $500 USD max per order
  if (amount > 50000) {
    return NextResponse.json({ error: 'Monto excede el límite permitido' }, { status: 400 })
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data } = await supabaseAdmin
    .from('app_settings')
    .select('value')
    .eq('key', 'stripe_secret_key')
    .single()

  if (!data?.value) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 400 })
  }

  try {
    const stripe = new Stripe(data.value)
    const intent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
    })
    return NextResponse.json({ clientSecret: intent.client_secret })
  } catch {
    return NextResponse.json({ error: 'Error al procesar el pago' }, { status: 500 })
  }
}
