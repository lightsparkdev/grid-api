/* THROW AWAY. Local vibe sketches for a hand on the share still. */

import { notFound } from 'next/navigation';
import { HandPreview } from './HandPreview';

export default function HandPreviewPage() {
  if (process.env.NODE_ENV === 'production') notFound();
  return <HandPreview />;
}
