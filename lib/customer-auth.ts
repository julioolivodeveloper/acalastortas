import { supabase } from './supabase'
import type { DbCustomer } from './supabase'

const phoneToEmail = (phone: string) => `${phone}@acalastortas.com`

export async function customerSignUp(
  name: string,
  phone: string,
  password: string
): Promise<DbCustomer> {
  const { data, error } = await supabase.auth.signUp({
    email: phoneToEmail(phone),
    password,
    options: { data: { name, phone } },
  })
  if (error) throw error
  if (!data.user) throw new Error('No se pudo crear la cuenta')

  // Upsert: links auth_id to existing customer record if phone already exists (preserves points/orders)
  const { data: customer, error: custErr } = await supabase
    .from('customers')
    .upsert(
      { name: name.trim(), phone, auth_id: data.user.id },
      { onConflict: 'phone' }
    )
    .select()
    .single()
  if (custErr) throw custErr
  return customer
}

export async function customerSignIn(
  phone: string,
  password: string
): Promise<DbCustomer | null> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: phoneToEmail(phone),
    password,
  })
  if (error) throw error

  // Primary lookup: by auth_id
  const { data: customer } = await supabase
    .from('customers')
    .select('*')
    .eq('auth_id', data.user.id)
    .maybeSingle()
  if (customer) return customer

  // Fallback: customer placed orders before creating account — link auth_id
  const { data: byPhone } = await supabase
    .from('customers')
    .select('*')
    .eq('phone', phone)
    .maybeSingle()
  if (byPhone) {
    await supabase
      .from('customers')
      .update({ auth_id: data.user.id })
      .eq('phone', phone)
    return { ...byPhone, auth_id: data.user.id }
  }

  // Brand new customer — create record
  const { data: newCustomer } = await supabase
    .from('customers')
    .insert({ name: 'Cliente', phone, auth_id: data.user.id })
    .select()
    .single()
  return newCustomer
}

export async function customerSignOut() {
  await supabase.auth.signOut()
}

export async function getLoggedInCustomer(): Promise<DbCustomer | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase
    .from('customers')
    .select('*')
    .eq('auth_id', user.id)
    .maybeSingle()
  return data
}
