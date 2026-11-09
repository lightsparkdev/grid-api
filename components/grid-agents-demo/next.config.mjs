import * as sass from 'sass';
import { createHash } from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Webpack's cache trusts node_modules by package version, so a patched package (patches/, applied by patch-package)
// would keep its stale unpatched build. The patches' contents go into the cache key instead.
const patchesDir = path.join(__dirname, 'patches');
const patchesHash = fs.existsSync(patchesDir)
  ? createHash('sha256')
      .update(fs.readdirSync(patchesDir).sort().map((f) => fs.readFileSync(path.join(patchesDir, f), 'utf8')).join('\n'))
      .digest('hex')
      .slice(0, 12)
  : 'none';

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
            value: "frame-ancestors 'self' https://docs.lightspark.com https://*.lightspark.com https://*.mintlify.app https://*.mintlify.dev https://*.mintlify.site http://localhost:*",
          },
        ],
      },
    ];
  },
  webpack: (config) => {
    if (config.cache && typeof config.cache === 'object') {
      config.cache.version = `${config.cache.version ?? ''}|patches-${patchesHash}`;
    }

    // Ensure dependencies imported by the local Origin package
    // resolve from this project's node_modules
    config.resolve.modules = [
      path.resolve(__dirname, 'node_modules'),
      'node_modules',
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
      '@lightsparkdev/origin/popover': path.resolve(
        __dirname,
        'node_modules/@lightsparkdev/origin/src/components/Popover/index.ts',
      ),
    };

    return config;
  },
};

export default nextConfig;
