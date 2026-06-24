/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['better-sqlite3', 'playwright'],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('better-sqlite3', 'playwright')
    }
    return config
  },
}

module.exports = nextConfig
