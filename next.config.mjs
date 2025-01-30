/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: process.env.NODE_ENV === 'production' ? '/MorseTrainer' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/MorseTrainer/' : '',
  
  // Compiler options
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Webpack configuration for better performance
  webpack: (config, { dev, isServer }) => {
    if (!dev) {
      config.mode = 'production';
      config.optimization = {
        ...config.optimization,
        minimize: true,
        moduleIds: 'deterministic',
        splitChunks: {
          chunks: 'all',
          minSize: 20000,
          minRemainingSize: 0,
          minChunks: 1,
          maxAsyncRequests: 30,
          maxInitialRequests: 30,
          cacheGroups: {
            defaultVendors: {
              test: /[\\/]node_modules[\\/]/,
              priority: -10,
              reuseExistingChunk: true,
            },
            default: {
              minChunks: 2,
              priority: -20,
              reuseExistingChunk: true,
            },
          },
        },
      };
    }
    return config;
  },

  // Enable React strict mode
  reactStrictMode: true,
};

export default nextConfig;
