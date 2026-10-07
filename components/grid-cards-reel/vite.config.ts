import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';

const here = path.dirname(fileURLToPath(import.meta.url));
/** The playground the card comes from. Read only: nothing here writes to it. */
const demo = path.resolve(here, '../grid-cards-demo');
const out = path.resolve(here, 'out');

/** The card's sources import these from the playground's own node_modules,
 *  which a fresh checkout doesn't have: resolve every one from here, and
 *  keep one copy of each (two Reacts or two threes break the scene). */
const SHARED_DEPS = ['react', 'react-dom', 'three', '@react-three/fiber', '@react-three/drei', 'zustand'];

/** `POST /__reel/write?path=<take>/<file>` writes the body under `out/`. */
function writeFrames(): Plugin {
  return {
    name: 'reel-write-frames',
    configureServer(server) {
      server.middlewares.use('/__reel/write', (req, res) => {
        const url = new URL(req.url ?? '', 'http://x');
        const rel = url.searchParams.get('path') ?? '';
        const target = path.resolve(out, rel);
        if (req.method !== 'POST' || !rel || !target.startsWith(out + path.sep)) {
          res.statusCode = 400;
          res.end('bad request');
          return;
        }
        const chunks: Buffer[] = [];
        req.on('data', (c: Buffer) => chunks.push(c));
        req.on('end', () => {
          fs.mkdirSync(path.dirname(target), { recursive: true });
          fs.writeFileSync(target, Buffer.concat(chunks));
          res.end('ok');
        });
      });
    },
  };
}

/** The surface bake worker has ES imports; Next bundles it, Vite serves it
 *  as written, so it has to start as a module worker or it dies on its
 *  first import (and every bake waits on it forever). Done at serve time:
 *  the playground's file is left as it is. */
function moduleBakeWorker(): Plugin {
  const from = "new Worker(new URL('./surfaceBake.worker.ts', import.meta.url))";
  return {
    name: 'reel-module-bake-worker',
    enforce: 'pre',
    transform(code, id) {
      if (!id.endsWith('/card3d/surfaceBakeClient.ts')) return;
      if (!code.includes(from)) throw new Error('surfaceBakeClient changed: update moduleBakeWorker');
      return code.replace(from, "new Worker(new URL('./surfaceBake.worker.ts', import.meta.url), { type: 'module' })");
    },
  };
}

export default defineConfig(({ mode }) => ({
  plugins: [moduleBakeWorker(), react(), writeFrames()],
  worker: { format: 'es' },
  // The card's sources read it to gate their dev hooks.
  define: { 'process.env.NODE_ENV': JSON.stringify(mode === 'production' ? 'production' : 'development') },
  publicDir: path.resolve(demo, 'public'),
  resolve: {
    alias: [
      // The barrel pulls in the glass UI and its SCSS; the card only wants the path.
      { find: /^@\/components\/liquid-glass$/, replacement: path.resolve(demo, 'src/components/liquid-glass/squircle.ts') },
      { find: /^@reel\//, replacement: path.resolve(here, 'src') + '/' },
      { find: /^@\//, replacement: path.resolve(demo, 'src') + '/' },
    ],
    dedupe: SHARED_DEPS,
  },
  optimizeDeps: {
    include: SHARED_DEPS,
  },
  server: {
    fs: { allow: [here, path.resolve(demo, 'src'), path.resolve(demo, 'public')] },
  },
}));
