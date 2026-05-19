import type { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://familygamescenter.fr';

/**
 * Sitemap statique (PR9 finitions). V1 = enumeration manuelle des routes
 * publiques. V2 si on ajoute des contenus dynamiques (articles blog, etc.) =
 * concat depuis BDD.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const route = (path: string, priority: number, changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] = 'monthly') => ({
    url: `${BASE_URL}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  });

  return [
    route('/', 1.0, 'weekly'),
    route('/reserver-anniversaire', 0.9, 'weekly'),
    route('/bowling', 0.8),
    route('/billard', 0.8),
    route('/arcade', 0.8),
    route('/realite-virtuelle', 0.8),
    route('/arcade-vr', 0.8),
    route('/karaoke', 0.8),
    route('/blind-test', 0.8),
    route('/flechettes', 0.8),
    route('/bar-snack', 0.7),
    route('/tarifs-et-formules', 0.8),
    route('/entreprises', 0.7),
    route('/contact', 0.6),
    route('/legal/mentions-legales', 0.3, 'yearly'),
    route('/legal/cgv', 0.3, 'yearly'),
    route('/legal/politique-confidentialite', 0.3, 'yearly'),
    route('/legal/cookies', 0.3, 'yearly'),
  ];
}
