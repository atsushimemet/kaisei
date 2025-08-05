/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    domains: ['localhost', 'kaisei-app.onrender.com'],
  },
  // CSS optimization for production
  experimental: {
    optimizeCss: true,
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
