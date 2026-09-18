import type { StatementModel } from './types';

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

function fileStem(statement: StatementModel) {
  const company =
    statement.brand.companyName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'company';
  return `${company}-statement-${statement.period.id}`;
}

export function statementExportFilename(
  statement: StatementModel,
  format: 'pdf' | 'html',
) {
  return `${fileStem(statement)}.${format}`;
}

async function sourceAsDataUrl(source: string): Promise<string> {
  if (source.startsWith('data:')) return source;
  const response = await fetch(source);
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
    '<style>html{background:#fff}body{margin:0;padding:1px;font-family:Arial,Helvetica,sans-serif}</style>',
    '</head>',
    `<body>${clone.outerHTML}</body>`,
    '</html>',
  ].join('');
}

export function downloadHtml(html: string, filename: string) {
  const url = URL.createObjectURL(new Blob([html], { type: 'text/html;charset=utf-8' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
