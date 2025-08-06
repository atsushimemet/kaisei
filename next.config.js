/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    domains: ['localhost', 'kaisei.onrender.com'],
  },
  // CSS optimization for production
  experimental: {
    optimizeCss: true,
  },
  // プロキシ環境での動作を改善
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ]
  },
  // Improve CSS loading
  webpack: (config, { dev }) => {
    if (dev) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          styles: {
            name: 'styles',
            test: /\.(css|scss|sass)$/,
            chunks: 'all',
            enforce: true,
          },
        },
      }
    }
    return config
  },
}

module.exports = nextConfig 
