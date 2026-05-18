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
      // `afterFiles` : les route handlers Next.js (notamment /api/admin/*)
      // ont la priorité ; tout le reste est proxifié vers Symfony.
      return {
        afterFiles: [
          {
            source: '/api/:path*',
            destination: `${API_BASE}/:path*`,
          },
        ],
        beforeFiles: [],
        fallback: [],
      };
    },
  }),
};

export default nextConfig;
