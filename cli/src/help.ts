import { Command, Help } from "commander";

const E = "\x1b";
const RESET = `${E}[0m`;
const BOLD = `${E}[1m`;
const DIM = `${E}[2m`;
const WHITE = `${E}[97m`;

function fg(n: number): string {
  return `${E}[38;5;${n}m`;
}

const CYAN = fg(45);
const BRIGHT_CYAN = fg(51);
const SUBTLE = fg(240);

const LINE = "\u2500";
const VERT = "\u2502";
const BL = "\u2514";

function termWidth(): number {
  return Math.min(process.stdout.columns || 80, 120);
}

function tty(): boolean {
  return process.stdout.isTTY ?? false;
}

function mulberry32(seed: number): () => number {
  let t = seed + 0x6d2b79f5;
  return () => {
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const FONT_H = 6;
const GLYPH: Record<string, number[][]> = {
  g: [
    [0, 1, 1, 1, 1, 0],
    [1, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0],
    [1, 0, 0, 1, 1, 1],
    [1, 0, 0, 0, 0, 1],
    [0, 1, 1, 1, 1, 0],
  ],
  r: [
    [1, 1, 1, 1, 0, 0],
    [1, 0, 0, 0, 1, 0],
    [1, 1, 1, 1, 0, 0],
    [1, 0, 0, 1, 0, 0],
    [1, 0, 0, 0, 1, 0],
    [1, 0, 0, 0, 1, 0],
  ],
  i: [
    [1, 1],
    [1, 1],
    [0, 0],
    [1, 1],
    [1, 1],
    [1, 1],
  ],
  d: [
    [1, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 0],
  ],
};

const BANDS: number[][] = [
  [17, 18, 23, 24],
  [25, 29, 30, 31],
  [36, 37, 38, 39],
  [44, 45, 73, 74],
  [50, 51, 80, 81, 87],
];

function pickColor(col: number, w: number, rand: () => number): string {
  const t = col / w;
  const noise = (rand() - 0.5) * 0.5;
  const b = Math.max(0, Math.min(0.999, t * 0.7 + 0.15 + noise));
  const band = BANDS[Math.floor(b * BANDS.length)];
  return fg(band[Math.floor(rand() * band.length)]);
}

function banner(): string {
  const w = termWidth();
  if (!tty()) return `  GRID - Global payments API\n${LINE.repeat(w)}`;

  const SCALE = 2;
  const GAP = 2;
  const letters = "grid".split("").map((c) => GLYPH[c]);
  const startX = Math.max(2, Math.floor(w * 0.04));
  const rand = mulberry32(42);
  const rows: string[] = [];

  for (let r = -1; r <= FONT_H; r++) {
    let line = "";
    for (let c = 0; c < w; c++) {
      let hit = false;
      if (r >= 0 && r < FONT_H) {
        let x = startX;
        for (const g of letters) {
          const sw = g[0].length * SCALE;
          if (c >= x && c < x + sw) {
            if (g[r][Math.floor((c - x) / SCALE)] === 1) hit = true;
            break;
          }
          x += sw + GAP;
        }
      }
      line += hit ? `${BOLD}${WHITE}\u2588` : `${pickColor(c, w, rand)}\u2588`;
    }
    rows.push(line + RESET);
  }
  return rows.join("\n");
}

function stripAnsi(s: string): string {
  return s.replace(/\x1b\[[0-9;]*m/g, "");
}

function section(title: string, body: string): string {
  const w = termWidth();
  if (!tty()) return `\n--- ${title} ---\n\n${body}\n`;

  const label = ` ${title} `;
  const left = 3;
  const right = Math.max(2, w - left - label.length);
  const lines: string[] = [];

  lines.push(
    `${DIM}${LINE.repeat(left)}${RESET}${BOLD}${BRIGHT_CYAN}${label}${RESET}${DIM}${LINE.repeat(right)}${RESET}`
  );

  lines.push(`${DIM}${VERT}${RESET}`);
  for (const row of body.split("\n")) {
    lines.push(`${DIM}${VERT}${RESET} ${row}`);
  }
  lines.push(`${DIM}${VERT}${RESET}`);

  lines.push(`${DIM}${BL}${LINE.repeat(w - 2)}${RESET}`);
  return lines.join("\n");
}

function rootHelp(cmd: Command): string {
  const color = tty();
  const parts: string[] = [];

  parts.push(banner());
  parts.push("");

  parts.push(section("Usage", `  ${cmd.name()} <command> [options]`));
  parts.push("");

  const opts = cmd.options;
  const mf = opts.length > 0 ? Math.max(...opts.map((o) => o.flags.length)) : 0;
  const optBody = opts
    .map((o) => {
      const f = color
        ? `${CYAN}${o.flags.padEnd(mf)}${RESET}`
        : o.flags.padEnd(mf);
      return `  ${f}  ${o.description || ""}`;
    })
    .join("\n");
  parts.push(section("Options", optBody));
  parts.push("");

  const cmds = cmd.commands.filter((c) => c.name() !== "help");
  const mn =
    cmds.length > 0
      ? Math.max(
          ...cmds.map((c) => {
            const a = c.aliases();
            return (a.length ? `${c.name()}|${a[0]}` : c.name()).length;
          })
        )
      : 0;
  const cmdBody = cmds
    .map((c) => {
      const a = c.aliases();
      const name = a.length ? `${c.name()}|${a[0]}` : c.name();
      const n = color
        ? `${CYAN}${name.padEnd(mn)}${RESET}`
        : name.padEnd(mn);
      return `  ${n}  ${c.description() || ""}`;
    })
    .join("\n");
  parts.push(section("Commands", cmdBody));
  parts.push("");

  if (color) {
    parts.push(
      `  ${SUBTLE}Run ${CYAN}grid <command> --help${SUBTLE} for more information on a command.${RESET}`
    );
  } else {
    parts.push(
      "  Run grid <command> --help for more information on a command."
    );
  }
  parts.push("");

  return parts.join("\n");
}

export function configureHelp(program: Command): void {
  program.configureHelp({
    formatHelp(cmd: Command, helper: Help): string {
      if (cmd.parent) {
        return Help.prototype.formatHelp.call(helper, cmd, helper);
      }
      return rootHelp(cmd);
    },
  });
}
