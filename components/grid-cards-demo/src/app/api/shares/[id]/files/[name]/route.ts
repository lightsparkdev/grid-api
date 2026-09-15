/* GET /api/shares/{id}/files/{name}: serve a stored file. Open CORS: the app
   draws these into canvases and WebGL textures. Immutable cache: a re-upload
   under the same name is rare and the client busts it with a query. */

import { createReadStream } from 'fs';
import { stat } from 'fs/promises';
import { Readable } from 'stream';

import { contentTypeFor, shareFilePath } from '@/lib/share/localFsStore';
import { fail } from '@/lib/share/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Ctx = { params: { id: string; name: string } };

export async function GET(_req: Request, { params }: Ctx) {
  const file = await shareFilePath(params.id, params.name);
  if (!file) return fail('not-found');

  const { size } = await stat(file);
  const body = Readable.toWeb(createReadStream(file)) as ReadableStream;
  return new Response(body, {
    status: 200,
    headers: {
      'content-type': contentTypeFor(params.name.split('.').pop() ?? ''),
      'content-length': String(size),
      'cache-control': 'public, max-age=31536000, immutable',
      'access-control-allow-origin': '*',
    },
  });
}
