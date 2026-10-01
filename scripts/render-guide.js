#!/usr/bin/env node
// Render a partner developer guide (a markdown file) to a single self-contained HTML file.
// Usage: node scripts/render-guide.js <guide>.md <guide>.html
// Requires markdown-it and mermaid (cd scripts && npm install).
const fs = require("fs");
const path = require("path");

const [, , input, output] = process.argv;
if (!input || !output) {
  console.error("usage: render-guide.js <guide>.md <guide>.html");
  process.exit(1);
}

// Raw HTML stays off so nothing in the markdown can inject markup into the deliverable.
const md = require("markdown-it")({ html: false, linkify: true });
const { escapeHtml } = md.utils;

const defaultFence = md.renderer.rules.fence;
md.renderer.rules.fence = (tokens, idx, options, env, self) => {
  const token = tokens[idx];
  if (token.info.trim() === "mermaid") {
    return `<pre class="mermaid">${escapeHtml(token.content)}</pre>`;
  }
  return defaultFence(tokens, idx, options, env, self);
};

const src = fs.readFileSync(input, "utf8");
const body = md.render(src);
const title = escapeHtml((src.match(/^# (.+)$/m) || [, path.basename(input, ".md")])[1]);

const mermaidJs = fs.readFileSync(require.resolve("mermaid/dist/mermaid.min.js"), "utf8");

const css = `
body{max-width:880px;margin:40px auto;padding:0 24px;font:16px/1.6 -apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif;color:#1f2328}
h1{font-size:2em;border-bottom:1px solid #d1d9e0;padding-bottom:.3em}
h2{font-size:1.5em;border-bottom:1px solid #d1d9e0;padding-bottom:.3em;margin-top:1.6em}
h3{font-size:1.2em;margin-top:1.4em}
code{font:85% ui-monospace,SFMono-Regular,Menlo,monospace;background:#f6f8fa;padding:.15em .35em;border-radius:4px}
pre{background:#f6f8fa;padding:14px;border-radius:6px;overflow-x:auto;line-height:1.45}
pre code{background:none;padding:0;font-size:85%}
table{border-collapse:collapse;width:100%;margin:1em 0;display:block;overflow-x:auto}
th,td{border:1px solid #d1d9e0;padding:6px 12px;text-align:left;vertical-align:top}
th{background:#f6f8fa}
pre.mermaid{background:#fff;text-align:center}
`;

fs.writeFileSync(
  output,
  `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><style>${css}</style></head><body>${body}
<script>${mermaidJs}</script>
<script>mermaid.initialize({ startOnLoad: true });</script>
</body></html>`
);
