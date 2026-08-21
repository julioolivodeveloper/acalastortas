export type MenuItem = {
  id: string
  name: string
  description: string
  price: number
  category: string
  available: boolean
  image?: string
}

export const CATEGORIES = [
  'Tortas',
  'Burritos',
  'Quesadillas',
  'Tacos',
  'Enchiladas',
  'Gorditas',
  'Bebidas',
  'Extras',
]

export const DEFAULT_MENU: MenuItem[] = [
  // TORTAS
  { id: 't1', name: 'Torta de Milanesa', description: 'Milanesa empanizada, lechuga, tomate, aguacate, crema y frijoles en telera', price: 11.99, category: 'Tortas', available: true },
  { id: 't2', name: 'Torta de Pollo', description: 'Pollo a la plancha, lechuga, tomate, aguacate, crema y frijoles en telera', price: 11.99, category: 'Tortas', available: true },
  { id: 't3', name: 'Torta de Carne Asada', description: 'Carne asada jugosa, lechuga, tomate, aguacate, crema y frijoles en telera', price: 12.99, category: 'Tortas', available: true },
  { id: 't4', name: 'Torta de Carnitas', description: 'Carnitas de cerdo, lechuga, tomate, aguacate, crema y frijoles en telera', price: 11.99, category: 'Tortas', available: true },
  { id: 't5', name: 'Torta de Chorizo', description: 'Chorizo mexicano, lechuga, tomate, aguacate, crema y frijoles en telera', price: 10.99, category: 'Tortas', available: true },
  { id: 't6', name: 'Torta de Pierna', description: 'Pierna de cerdo deshebrada, lechuga, tomate, aguacate, crema y frijoles', price: 10.99, category: 'Tortas', available: true },
  { id: 't7', name: 'Torta Cubana', description: 'Chorizo, jamón, milanesa, huevo, queso, crema y frijoles — ¡La completa!', price: 13.99, category: 'Tortas', available: true },
  { id: 't8', name: 'Torta de Jamón', description: 'Jamón, queso amarillo, lechuga, tomate y crema en telera', price: 9.99, category: 'Tortas', available: true },
  { id: 't9', name: 'Torta de Huevo', description: 'Huevo revuelto o estrellado, frijoles, crema y queso en telera', price: 9.99, category: 'Tortas', available: true },
  { id: 't10', name: 'Torta de Chicharrón', description: 'Chicharrón en salsa verde o roja, crema y frijoles en telera', price: 10.99, category: 'Tortas', available: true },

  // BURRITOS
  { id: 'b1', name: 'Burrito de Asada', description: 'Carne asada, arroz, frijoles, queso, crema y guacamole en tortilla de harina', price: 12.99, category: 'Burritos', available: true },
  { id: 'b2', name: 'Burrito de Pollo', description: 'Pollo a la plancha, arroz, frijoles, queso, crema y guacamole', price: 12.99, category: 'Burritos', available: true },
  { id: 'b3', name: 'Burrito de Carnitas', description: 'Carnitas, arroz, frijoles, queso, crema y guacamole', price: 12.99, category: 'Burritos', available: true },
  { id: 'b4', name: 'Burrito de Chorizo', description: 'Chorizo mexicano, arroz, frijoles, queso y crema', price: 11.99, category: 'Burritos', available: true },
  { id: 'b5', name: 'Burrito de Frijoles y Queso', description: 'Frijoles refritos y queso fundido en tortilla de harina', price: 9.99, category: 'Burritos', available: true },

  // QUESADILLAS
  { id: 'q1', name: 'Quesadilla de Asada', description: 'Carne asada con queso Oaxaca derretido en tortilla de harina', price: 11.99, category: 'Quesadillas', available: true },
  { id: 'q2', name: 'Quesadilla de Pollo', description: 'Pollo a la plancha con queso Oaxaca derretido en tortilla de harina', price: 11.99, category: 'Quesadillas', available: true },
  { id: 'q3', name: 'Quesadilla de Queso', description: 'Queso Oaxaca fundido en tortilla de harina, crema y guacamole', price: 8.99, category: 'Quesadillas', available: true },

  // TACOS (3 por orden)
  { id: 'ta1', name: 'Tacos de Asada (3)', description: '3 tacos de carne asada en tortilla de maíz con cilantro y cebolla', price: 12.99, category: 'Tacos', available: true },
  { id: 'ta2', name: 'Tacos de Pollo (3)', description: '3 tacos de pollo a la plancha en tortilla de maíz con cilantro y cebolla', price: 11.99, category: 'Tacos', available: true },
  { id: 'ta3', name: 'Tacos de Carnitas (3)', description: '3 tacos de carnitas en tortilla de maíz con cilantro y cebolla', price: 11.99, category: 'Tacos', available: true },
  { id: 'ta4', name: 'Tacos de Chorizo (3)', description: '3 tacos de chorizo en tortilla de maíz con cilantro y cebolla', price: 10.99, category: 'Tacos', available: true },
  { id: 'ta5', name: 'Tacos de Papa (3)', description: '3 tacos de papa con queso en tortilla de maíz', price: 9.99, category: 'Tacos', available: true },

  // ENCHILADAS (3 por orden)
  { id: 'e1', name: 'Enchiladas de Asada (3)', description: '3 enchiladas de carne asada con salsa roja, crema y queso. Incluye arroz y frijoles', price: 12.99, category: 'Enchiladas', available: true },
  { id: 'e2', name: 'Enchiladas de Pollo (3)', description: '3 enchiladas de pollo con salsa roja o verde, crema y queso. Incluye arroz y frijoles', price: 11.99, category: 'Enchiladas', available: true },
  { id: 'e3', name: 'Enchiladas de Queso (3)', description: '3 enchiladas de queso con salsa roja, crema y queso. Incluye arroz y frijoles', price: 9.99, category: 'Enchiladas', available: true },

  // GORDITAS
  { id: 'g1', name: 'Gordita de Asada', description: 'Masa de maíz rellena de carne asada, queso, crema y salsa', price: 10.99, category: 'Gorditas', available: true },
  { id: 'g2', name: 'Gordita de Chicharrón', description: 'Masa de maíz rellena de chicharrón en salsa y queso', price: 9.99, category: 'Gorditas', available: true },
  { id: 'g3', name: 'Gordita de Frijoles', description: 'Masa de maíz rellena de frijoles refritos y queso', price: 8.99, category: 'Gorditas', available: true },

  // BEBIDAS
  { id: 'dr1', name: 'Horchata (32 oz)', description: 'Agua fresca de arroz con canela hecha en casa', price: 3.99, category: 'Bebidas', available: true },
  { id: 'dr2', name: 'Jamaica (32 oz)', description: 'Agua fresca de flor de jamaica hecha en casa', price: 3.99, category: 'Bebidas', available: true },
  { id: 'dr3', name: 'Tamarindo (32 oz)', description: 'Agua fresca de tamarindo hecha en casa', price: 3.99, category: 'Bebidas', available: true },
  { id: 'dr4', name: 'Limonada (32 oz)', description: 'Limonada natural preparada al momento', price: 3.99, category: 'Bebidas', available: true },
  { id: 'dr5', name: 'Refresco (lata)', description: 'Coke, Sprite, Fanta o Dr Pepper', price: 2.50, category: 'Bebidas', available: true },
  { id: 'dr6', name: 'Agua Embotellada', description: 'Agua purificada 500ml', price: 1.50, category: 'Bebidas', available: true },

  // EXTRAS
  { id: 'ex1', name: 'Papas Fritas', description: 'Papas a la francesa crujientes con sal', price: 3.99, category: 'Extras', available: true },
  { id: 'ex2', name: 'Arroz con Frijoles', description: 'Arroz mexicano y frijoles de olla', price: 3.99, category: 'Extras', available: true },
  { id: 'ex3', name: 'Guacamole', description: 'Guacamole fresco hecho al momento con totopos', price: 2.99, category: 'Extras', available: true },
  { id: 'ex4', name: 'Salsa Extra', description: 'Salsa verde o roja de la casa', price: 0.99, category: 'Extras', available: true },
]
