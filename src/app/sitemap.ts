import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://ezymemo.com';

  const lastModified = new Date();

    const staticRoutes: any[] = [
    {
      url: `${baseUrl}/`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    '/pricing',
  ];

  const dynamicRoutes: string[] = [
    '/pricing',
  ];

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

    const response = await fetch(`${apiUrl}/shops/all`, {
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      console.error('Failed to fetch shops for sitemap');
      return staticRoutes;
    }

    const shopsData = await response.json();

    if (shopsData.success && Array.isArray(shopsData.data)) {
      const shops = shopsData.data as Array<{ shop_slug: string; updated_at: string; is_active: boolean }>;

      for (const shop of shops) {
        if (!shop.is_active) continue;

        const shopLastModified = new Date(shop.updated_at);
        const shopPriority = 0.9;

        staticRoutes.push(
          {
            url: `${baseUrl}/s/${shop.shop_slug}`,
            lastModified: shopLastModified,
            changeFrequency: 'weekly',
            priority: shopPriority,
          },
          {
            url: `${baseUrl}/s/${shop.shop_slug}/reviews`,
            lastModified: shopLastModified,
            changeFrequency: 'weekly',
            priority: 0.7,
          },
          {
            url: `${baseUrl}/s/${shop.shop_slug}/cart`,
            lastModified: shopLastModified,
            changeFrequency: 'weekly',
            priority: 0.5,
          },
        );

        try {
          const productsResponse = await fetch(`${apiUrl}/products/shop/${shop.shop_slug}`, {
            next: { revalidate: 3600 },
          });

          if (productsResponse.ok) {
            const productsData = await productsResponse.json();

            if (productsData.success && Array.isArray(productsData.data)) {
              const products = productsData.data as Array<{ sku: string; updated_at: string }>;

              for (const product of products) {
                const productLastModified = new Date(product.updated_at);
                staticRoutes.push({
                  url: `${baseUrl}/s/${shop.shop_slug}/p/${product.sku}`,
                  lastModified: productLastModified,
                  changeFrequency: 'weekly',
                  priority: 0.8,
                });
              }
            }
          }
        } catch (error) {
          console.error(`Failed to fetch products for shop ${shop.shop_slug}:`, error);
        }
      }
    }

    staticRoutes.sort((a, b) => {
      const aPriority = a.priority || 0;
      const bPriority = b.priority || 0;
      if (aPriority !== bPriority) {
        return bPriority - aPriority;
      }
      return 0;
    });

    return staticRoutes;
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return staticRoutes;
  }
}
