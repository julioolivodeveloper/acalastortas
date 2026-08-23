/**
 * Seed ingredients for all menu items based on name patterns.
 * Run with: node seed-ingredients.mjs
 */
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://vpmisuaeowszgmmpbabd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwbWlzdWFlb3dzemdtbXBiYWJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc0NTIzMTcsImV4cCI6MjEwMzAyODMxN30.LGkzlKjj1_Z3m9w9dlHk3lGTcXzKpwfFn6eIvaAsdBM'
)

// Base ingredients shared by most tortas
const TORTA_BASE = ['Pan bolillo', 'Aguacate', 'Lechuga', 'Jitomate', 'Cebolla', 'Mayonesa']

// Ingredients per category/name pattern
function getIngredients(name, category) {
  const n = name.toLowerCase()

  if (category === 'Tortas') {
    const base = [...TORTA_BASE]
    if (n.includes('jamón') || n.includes('jamon')) return [...base, 'Jamón', 'Queso']
    if (n.includes('pastor')) return [...base, 'Carne al Pastor', 'Piña']
    if (n.includes('bistec')) return [...base, 'Bistec']
    if (n.includes('milanesa')) return [...base, 'Milanesa empanizada']
    if (n.includes('menonita')) return [...base, 'Carne Menonita', 'Queso Menonita']
    if (n.includes('carnitas')) return [...base, 'Carnitas']
    if (n.includes('chorizo') && n.includes('buche')) return [...base, 'Chorizo', 'Buche']
    if (n.includes('chorizo')) return [...base, 'Chorizo']
    if (n.includes('barbacoa')) return [...base, 'Barbacoa']
    if (n.includes('pollo')) return [...base, 'Pollo a la plancha']
    if (n.includes('chuleta')) return [...base, 'Chuleta ahumada']
    if (n.includes('colita') || n.includes('pavo')) return [...base, 'Colita de pavo']
    if (n.includes('buche')) return [...base, 'Buche']
    if (n.includes('asada') || n.includes('res')) return [...base, 'Carne asada']
    return base
  }

  if (category === 'Hamburguesas') {
    const base = ['Pan de hamburguesa', 'Lechuga', 'Jitomate', 'Cebolla', 'Pepinillo', 'Mayonesa']
    if (n.includes('doble')) return ['Doble carne', 'Queso', ...base]
    if (n.includes('pollo')) return ['Pollo picante', 'Queso', ...base]
    if (n.includes('bbq')) return ['Carne', 'Queso', 'Salsa BBQ', ...base]
    return ['Carne', 'Queso', ...base]
  }

  if (category === 'Tacos') {
    const base = ['Tortilla de maíz', 'Cebolla', 'Cilantro', 'Salsa']
    if (n.includes('pastor')) return [...base, 'Carne al Pastor', 'Piña']
    if (n.includes('carnitas')) return [...base, 'Carnitas']
    if (n.includes('bistec')) return [...base, 'Bistec']
    if (n.includes('asada')) return [...base, 'Carne asada']
    if (n.includes('pollo')) return [...base, 'Pollo']
    if (n.includes('barbacoa')) return [...base, 'Barbacoa']
    return [...base, 'Carne']
  }

  if (category === 'Burritos') {
    const base = ['Tortilla de harina grande', 'Arroz', 'Frijoles', 'Queso', 'Crema']
    if (n.includes('pastor')) return [...base, 'Carne al Pastor']
    if (n.includes('carnitas')) return [...base, 'Carnitas']
    if (n.includes('bistec')) return [...base, 'Bistec']
    if (n.includes('asada')) return [...base, 'Carne asada']
    if (n.includes('pollo')) return [...base, 'Pollo']
    if (n.includes('verde')) return [...base, 'Chile verde']
    if (n.includes('rojo')) return [...base, 'Chile rojo']
    return base
  }

  if (category === 'Quesadillas') {
    const base = ['Tortilla de harina', 'Queso Chihuahua']
    if (n.includes('pollo')) return [...base, 'Pollo']
    if (n.includes('bistec')) return [...base, 'Bistec']
    if (n.includes('pastor')) return [...base, 'Carne al Pastor']
    return base
  }

  if (category === 'Flautas y Pollo') {
    if (n.includes('flauta') || n.includes('taquito')) {
      const base = ['Tortilla de maíz', 'Crema', 'Queso', 'Lechuga', 'Jitomate']
      if (n.includes('pollo')) return [...base, 'Pollo desmenuzado']
      if (n.includes('papa')) return [...base, 'Papa']
      return [...base, 'Pollo']
    }
    if (n.includes('pollo')) {
      return ['Pollo', 'Arroz', 'Frijoles', 'Crema', 'Queso']
    }
  }

  return []
}

async function main() {
  console.log('Fetching menu items...')
  const { data: items, error } = await supabase.from('menu_items').select('id, name, category, ingredients')
  if (error) { console.error('Error fetching items:', error.message); process.exit(1) }

  console.log(`Found ${items.length} items. Updating ingredients...`)
  let updated = 0
  let skipped = 0

  for (const item of items) {
    // Skip if already has ingredients
    if (item.ingredients && item.ingredients.length > 0) {
      console.log(`  SKIP  ${item.name} (already has ${item.ingredients.length} ingredients)`)
      skipped++
      continue
    }

    const ingredients = getIngredients(item.name, item.category)
    if (ingredients.length === 0) {
      console.log(`  SKIP  ${item.name} — no pattern matched`)
      skipped++
      continue
    }

    const { error: updateError } = await supabase
      .from('menu_items')
      .update({ ingredients })
      .eq('id', item.id)

    if (updateError) {
      console.error(`  ERROR ${item.name}:`, updateError.message)
    } else {
      console.log(`  ✓     ${item.name} → [${ingredients.join(', ')}]`)
      updated++
    }
  }

  console.log(`\nDone! ${updated} updated, ${skipped} skipped.`)
}

main()
