/** @type {import('next').NextConfig} */
const isGithubPages = process.env.GITHUB_PAGES === 'true';
const repoName = 'fgc-website';

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://127.0.0.1:8000/api';

const nextConfig = {
  reactStrictMode: true,
  output: isGithubPages ? 'export' : undefined,
  basePath: isGithubPages ? `/${repoName}` : '',
  assetPrefix: isGithubPages ? `/${repoName}/` : undefined,
  images: {
    formats: ['image/avif', 'image/webp'],
    unoptimized: true,
  },
  ...(!isGithubPages && {
    async rewrites() {
      if (process.env.NODE_ENV !== 'development') return [];
      // `fallback` : on laisse Next.js gérer tous ses routes (statiques
      // ET dynamiques comme /api/admin/proxy/[...path]) ; seul le reliquat
      // /api/* est proxifié vers Symfony pour les appels publics côté client.
      return {
        beforeFiles: [],
        afterFiles: [],
        fallback: [
          {
            source: '/api/:path*',
            destination: `${API_BASE}/:path*`,
          },
        ],
      };
    },
  }),
};

export default nextConfig;
