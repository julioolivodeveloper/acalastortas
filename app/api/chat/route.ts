import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic()

const SYSTEM_PROMPT = `Eres el asistente virtual de La Fondita de Mamá, restaurante mexicano en Socorro, El Paso TX.

DATOS DEL RESTAURANTE:
- Dirección: 10076 N Loop Dr, Socorro, TX 79927
- Teléfono/WhatsApp: (915) 858-8226
- Horario: Lunes a Domingo 8:00am – 10:00pm
- Sitio web: lafonditademama.com

MENÚ (categorías):
- Tortas (carne asada, milanesa, chorizo, pollo, etc.)
- Hamburguesas (sencilla, doble, especial)
- Burritos (machaca, frijol, carne, pollo)
- Tacos (pastor, carne asada, birria, pollo)
- Quesadillas
- Flautas y Pollo
- Menú Kids
- Bebidas (aguas frescas, refrescos, jugos)

PEDIDOS:
- Online con pickup: lafonditademama.com/menu
- WhatsApp: (915) 858-8226
- En persona en el local

PAGO: Efectivo y tarjeta de crédito/débito
PUNTOS: 1 punto por cada dólar gastado — acumula para descuentos futuros
DELIVERY: Disponible por DoorDash

REGLAS:
- Responde siempre en español, tono amigable y cálido
- Máximo 2–3 oraciones por respuesta; sé conciso
- Para ver el menú completo con precios, dirige al usuario a lafonditademama.com/menu
- Si preguntan por algo que no sabes con certeza, sugiere llamar al (915) 858-8226
- No inventes precios exactos; di que están en el menú online
- Usa emojis con moderación (1 máximo por mensaje)`

type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
}

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json() as { messages: ChatMessage[] }

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Mensajes inválidos' }, { status: 400 })
    }

    // Cap conversation history to last 10 messages
    const trimmed = messages.slice(-10)

    const stream = client.messages.stream({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      system: SYSTEM_PROMPT,
      messages: trimmed,
    })

    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        for await (const event of stream) {
          if (
            event.type === 'content_block_delta' &&
            event.delta.type === 'text_delta'
          ) {
            controller.enqueue(encoder.encode(event.delta.text))
          }
        }
        controller.close()
      },
      cancel() {
        stream.abort()
      },
    })

    return new Response(readable, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  } catch (err) {
    console.error('Chat error:', err)
    return NextResponse.json(
      { error: 'Error al procesar tu mensaje' },
      { status: 500 }
    )
  }
}
