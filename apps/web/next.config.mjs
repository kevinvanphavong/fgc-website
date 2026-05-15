/** @type {import('next').NextConfig} */
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://127.0.0.1:8000/api';

const nextConfig = {
  reactStrictMode: true,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  /**
   * Rewrite : tout appel /api/* depuis le front est proxifié vers le backend
   * Symfony en local. En prod, le front appelle directement
   * https://api.familygamescenter.fr/* via NEXT_PUBLIC_API_BASE_URL.
   * On garde le rewrite uniquement en dev pour éviter les soucis CORS.
   */
  async rewrites() {
    if (process.env.NODE_ENV !== 'development') return [];
    return [
      {
        source: '/api/:path*',
        destination: `${API_BASE}/:path*`,
      },
    ];
  },
};

export default nextConfig;
