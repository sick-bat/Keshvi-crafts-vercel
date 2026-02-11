import { MetadataRoute } from 'next';
import products from '@/data/products.json';

const BASE_URL = 'https://keshvicrafts.com';

export default function sitemap(): MetadataRoute.Sitemap {
    const staticRoutes = [
        '',
        '/collections',
        '/wishlist',
        '/cart',
        '/shipping',
        '/returns',
        '/privacy',
        '/terms',
        '/contact',
    ].map((route) => ({
        url: `${BASE_URL}${route}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: route === '' ? 1.0 : 0.8,
    }));

    const productRoutes = products.map((product) => ({
        url: `${BASE_URL}/products/${product.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.9,
    }));

    return [...staticRoutes, ...productRoutes];
}
