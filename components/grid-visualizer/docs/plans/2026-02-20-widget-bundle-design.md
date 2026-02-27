# Grid Visualizer Widget Bundle Design

## Goal

Bundle Grid Visualizer as a React component library so it can be imported directly into the Mintlify docs site as a custom component — no iframe needed.

## Build Architecture

Dual build: Next.js for standalone app (unchanged), Vite library mode for the embeddable widget.

```
grid-visualizer/
├── src/
│   ├── app/              # Next.js app (unchanged)
│   ├── components/       # Shared components (unchanged)
│   ├── hooks/            # Shared hooks (unchanged)
│   ├── lib/              # Shared logic (unchanged)
│   ├── data/             # Shared data (unchanged)
│   └── widget/
│       └── index.tsx     # Library entry point
├── vite.config.ts        # Vite library build config
├── next.config.mjs       # Standalone app build (existing)
└── package.json          # Add "build:widget" script + exports
```

### Output

```
dist/
├── grid-visualizer.es.js    # ESM bundle (~300-400KB gzip)
├── style.css                 # All styles, scoped to .grid-visualizer
└── package.json              # { "module": "grid-visualizer.es.js" }
```

## Component API

```tsx
interface GridVisualizerProps {
  /** 'light' | 'dark' — controlled theme */
  theme?: 'light' | 'dark';
  /** Callback when user toggles theme internally */
  onThemeChange?: (theme: 'light' | 'dark') => void;
  /** Show/hide header+footer chrome. Default: true */
  chrome?: boolean;
  /** Additional className on root container */
  className?: string;
}
```

### Resolution Order (supports both React props and iframe postMessage)

| Setting | 1st priority | 2nd fallback | 3rd fallback |
|---------|-------------|--------------|--------------|
| Theme   | `theme` prop | `postMessage` from parent | internal (localStorage / system pref) |
| Chrome  | `chrome` prop | `?embed=true` query param | `true` (show all) |

### Usage

```tsx
// Mintlify React import
import { GridVisualizer } from '@lightspark/grid-visualizer';
import '@lightspark/grid-visualizer/style.css';

<GridVisualizer theme="dark" chrome={false} />

// Iframe embed (existing, unchanged)
<iframe src="https://grid-visualizer.vercel.app/?embed=true&theme=dark" />

// Standalone (no props)
<GridVisualizer />
```

## Styles

Three layers compiled into one `style.css`:

1. Origin tokens (`globals.scss`) — CSS custom properties
2. Global styles (`globals.scss`) — reset, typography, dark mode
3. CSS Modules (`*.module.scss`) — component-scoped

### CSS Variable Scoping

Origin tokens define `:root` variables that could collide with the host site. PostCSS rewrites `:root` selectors to `.grid-visualizer` at build time so styles are self-contained.

```css
/* Before */
:root { --text-primary: #1a1a1a; }

/* After */
.grid-visualizer { --text-primary: #1a1a1a; }
```

## Dependencies

| Dependency | Bundled? | Reason |
|-----------|----------|--------|
| `react`, `react-dom` | External | Host provides |
| `@lightsparkdev/origin` | Bundled | Vendor, not on npm |
| `motion` | Bundled | Animation lib |
| `match-sorter` | Bundled | Small utility |
| `clsx` | Bundled | Tiny utility |
| `circle-flags` | Bundled | Static SVGs |
| `@central-icons-react/*` | Bundled | Icon SVGs |
| `react-syntax-highlighter` | Bundled | Code display (~150KB) |
| `@base-ui/react` | Bundled | UI primitives |
| `torph` | Bundled | Text morph animation |

## Key Decisions

- **No URL manipulation in widget mode**: Popular flows and mobile back button use internal state only (no `history.pushState`)
- **Widget wraps existing components**: `src/widget/index.tsx` is a thin wrapper around existing `Home` logic with Next.js shell stripped
- **Existing standalone app unchanged**: The Next.js build continues to work as-is
- **`'use client'` directives harmless**: Vite ignores them, no need to strip
