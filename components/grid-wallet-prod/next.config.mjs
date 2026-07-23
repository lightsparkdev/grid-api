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
            value: "frame-ancestors 'self' https://docs.lightspark.com https://*.lightspark.com https://*.mintlify.app https://*.mintlify.dev http://localhost:*",
          },
        ],
      },
    ];
  },
  webpack: (config) => {
    // Ensure dependencies imported by the local Origin package resolve from
    // this project's node_modules. The relative 'node_modules' entry comes
    // FIRST so webpack's default nested walk-up still wins (e.g. @turnkey/crypto's
    // own node_modules/@noble/* pin, which differs from this project's top-level
    // @noble/* version and exports different subpaths) — the absolute path is
    // only a fallback for imports with no node_modules to walk up from.
    config.resolve.modules = [
      'node_modules',
      path.resolve(__dirname, 'node_modules'),
    ];

    // Origin only exports its main barrel — narrow imports for tree-shaken components.
    config.resolve.alias = {
      ...config.resolve.alias,
      '@lightsparkdev/origin/checkbox': path.resolve(
        __dirname,
        'node_modules/@lightsparkdev/origin/src/components/Checkbox/index.ts',
      ),
      '@lightsparkdev/origin/badge': path.resolve(
        __dirname,
        'node_modules/@lightsparkdev/origin/src/components/Badge/index.ts',
      ),
    };

    return config;
  },
};

export default nextConfig;
