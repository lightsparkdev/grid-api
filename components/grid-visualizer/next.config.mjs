import * as sass from 'sass';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@lightsparkdev/origin'],
  typescript: {
    // Origin is source-linked without its own node_modules,
    // so its transitive type imports can't resolve from ../origin
    ignoreBuildErrors: true,
  },
  sassOptions: {
    implementation: sass,
    importers: [new sass.NodePackageImporter(__dirname)],
    includePaths: [
      path.resolve(__dirname, 'node_modules'),
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self' https://grid.lightspark.com https://*.lightspark.com http://localhost:*",
          },
        ],
      },
    ];
  },
  webpack: (config) => {
    // Ensure dependencies imported by the local Origin package
    // resolve from this project's node_modules
    config.resolve.modules = [
      path.resolve(__dirname, 'node_modules'),
      'node_modules',
    ];

    return config;
  },
};

export default nextConfig;
