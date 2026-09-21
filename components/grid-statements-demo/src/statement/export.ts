import type { StatementModel } from './types';
import { statementFileStem } from './presentation';

const EXPORTED_PROPERTIES = [
  'align-items',
  'background',
  'background-color',
  'border',
  'border-bottom',
  'border-radius',
  'border-top',
  'box-sizing',
  'color',
  'column-gap',
  'display',
  'flex-direction',
  'font-size',
  'font-style',
  'font-variant-numeric',
  'font-weight',
  'gap',
  'grid-column',
  'grid-template-columns',
  'height',
  'justify-content',
  'letter-spacing',
  'line-height',
  'margin',
  'margin-bottom',
  'margin-left',
  'margin-top',
  'max-height',
  'max-width',
  'min-width',
  'object-fit',
  'object-position',
  'overflow',
  'padding',
  'padding-bottom',
  'padding-left',
  'padding-right',
  'padding-top',
  'position',
  'text-align',
  'white-space',
  'width',
] as const;

export function statementExportFilename(
  statement: StatementModel,
  format: 'pdf' | 'html',
) {
  return `${statementFileStem(statement)}.${format}`;
}

async function sourceAsDataUrl(source: string): Promise<string> {
  if (source.startsWith('data:')) return source;
  const response = await fetch(source);
  if (!response.ok) throw new Error(`Could not embed image: ${response.status}`);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => resolve(String(reader.result)));
    reader.addEventListener('error', () => reject(reader.error));
    reader.readAsDataURL(blob);
  });
}

export async function buildStatementHtml(
  source: HTMLElement,
  title: string,
): Promise<string> {
  const clone = source.cloneNode(true) as HTMLElement;
  const originals = [source, ...Array.from(source.querySelectorAll<HTMLElement>('*'))];
  const copies = [clone, ...Array.from(clone.querySelectorAll<HTMLElement>('*'))];

  originals.forEach((element, index) => {
    const computed = getComputedStyle(element);
    const copy = copies[index];
    for (const property of EXPORTED_PROPERTIES) {
      const value = computed.getPropertyValue(property);
      if (value) copy.style.setProperty(property, value);
    }
    copy.removeAttribute('class');
  });

  const images = Array.from(clone.querySelectorAll<HTMLImageElement>('img'));
  await Promise.all(
    images.map(async (image) => {
      image.src = await sourceAsDataUrl(image.src);
      image.removeAttribute('srcset');
    }),
  );

  clone.style.maxWidth = '600px';
  clone.style.margin = '32px auto';
  clone.style.fontFamily = 'Arial, Helvetica, sans-serif';

  return [
    '<!doctype html>',
    '<html lang="en">',
    '<head>',
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    `<title>${title.replace(/[<>&"]/g, '')}</title>`,
    '<style>@page{size:auto;margin:12mm}html{background:#fff}body{margin:0;padding:1px;font-family:Arial,Helvetica,sans-serif}@media print{body{padding:0}article{margin:0 auto!important;box-shadow:none!important}}</style>',
    '</head>',
    `<body>${clone.outerHTML}</body>`,
    '</html>',
  ].join('');
}

export async function printStatementHtml(source: HTMLElement, title: string) {
  const html = await buildStatementHtml(source, title);
  const frame = document.createElement('iframe');
  frame.setAttribute('title', 'Statement PDF');
  frame.style.position = 'fixed';
  frame.style.width = '1px';
  frame.style.height = '1px';
  frame.style.opacity = '0';
  frame.style.pointerEvents = 'none';
  document.body.append(frame);

  const target = frame.contentWindow;
  if (!target) {
    frame.remove();
    throw new Error('Could not create the print document.');
  }
  target.document.open();
  target.document.write(html);
  target.document.close();
  await Promise.all(
    Array.from(target.document.images).map((image) =>
      image.complete
        ? Promise.resolve()
        : new Promise<void>((resolve) => {
            image.addEventListener('load', () => resolve(), { once: true });
            image.addEventListener('error', () => resolve(), { once: true });
          }),
    ),
  );
  target.focus();
  const cleanup = () => frame.remove();
  target.addEventListener('afterprint', cleanup, { once: true });
  target.print();
  window.setTimeout(cleanup, 60_000);
}

export function downloadHtml(html: string, filename: string) {
  const url = URL.createObjectURL(new Blob([html], { type: 'text/html;charset=utf-8' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}
