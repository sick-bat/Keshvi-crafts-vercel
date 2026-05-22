import { MetadataRoute } from 'next';
import products from '@/data/products.json';
import { DISPLAY_CATEGORIES, CATEGORY_SLUGS } from '@/lib/categories';
import type { Product } from '@/types';

const BASE_URL = 'https://www.keshvicrafts.in';
const LAST_MODIFIED = new Date('2026-05-21');

export default function sitemap(): MetadataRoute.Sitemap {
    const staticRoutes = [
        '',
        '/collections',
        '/shipping',
        '/returns',
        '/privacy',
        '/terms',
        '/contact',
    ].map((route) => ({
        url: `${BASE_URL}${route}`,
        lastModified: LAST_MODIFIED,
        changeFrequency: 'weekly' as const,
        priority: route === '' ? 1.0 : 0.8,
    }));

    const categoryRoutes = DISPLAY_CATEGORIES.map((category) => ({
        url: `${BASE_URL}/collections/${CATEGORY_SLUGS[category]}`,
        lastModified: LAST_MODIFIED,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }));

    const productRoutes = (products as Product[])
        .filter((product) => (product.status ?? 'live') !== 'hidden')
        .map((product) => ({
            url: `${BASE_URL}/products/${product.slug}`,
            lastModified: LAST_MODIFIED,
            changeFrequency: 'weekly' as const,
            priority: 0.9,
        }));

    return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
