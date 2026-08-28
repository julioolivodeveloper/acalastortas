import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard/', '/pedido/', '/api/', '/pantalla/'],
    },
    sitemap: 'https://lafonditademama.com/sitemap.xml',
  }
}
