import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      allow: ['/shop/', '/pricing'],
      disallow: ['/dashboard/', '/admin/', '/auth/', '/orders/', '/products/', '/customers/', '/invoices/', '/categories/', '/attributes/', '/payment-methods/', '/subscription'],
    },
    sitemap: 'https://ezymemo.com/sitemap.xml',
  };
}
