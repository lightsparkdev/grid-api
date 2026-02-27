# Using Origin in Your App

## Installation

### 1. Configure npm for GitHub Packages

Create `.npmrc` in your project root:

```
@jaymantri:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NPM_TOKEN}
```

Set the `NPM_TOKEN` environment variable with a GitHub Personal Access Token that has `read:packages` scope.

### 2. Install the Package

```bash
npm install @jaymantri/origin
```

For local development alongside Origin:

```json
{ "dependencies": { "@jaymantri/origin": "file:../origin" } }
```

### 3. Configure Next.js

```ts
// next.config.ts
import type { NextConfig } from "next";
import * as sass from "sass";

const nextConfig: NextConfig = {
  transpilePackages: ['@jaymantri/origin'],
  sassOptions: {
    // Enable pkg: imports for SCSS from node_modules
    importers: [new sass.NodePackageImporter()],
  },
};

export default nextConfig;
```

### 4. Copy Fonts

Copy fonts from `origin/public/fonts/` to `your-app/public/fonts/`.

Font files must be served from the consuming app's public folder.

### 5. Configure `globals.scss`

```scss
@use 'pkg:@jaymantri/origin/tokens/variables';
@use 'pkg:@jaymantri/origin/tokens/fonts';
@use 'pkg:@jaymantri/origin/tokens/typography';
@use 'pkg:@jaymantri/origin/tokens/effects';
@use 'pkg:@jaymantri/origin/tokens/reset';

body {
  margin: 0;
  font-family: var(--font-family-sans);
  color: var(--text-primary);
  background-color: var(--surface-primary);
  -webkit-font-smoothing: antialiased;
}
```

The `_reset.scss` file includes:
- Box-sizing reset
- Form element defaults (removes browser backgrounds)
- Typography resets (h1-h6, p margins)
- Font feature settings
- Icon system CSS (preserves stroke width at any icon size)

## Component Usage

```tsx
import { Button, Input, Field, CentralIcon } from '@jaymantri/origin';

<Button variant="filled">Click me</Button>
<Field>
  <Field.Label>Email</Field.Label>
  <Input placeholder="email@example.com" />
</Field>
<CentralIcon name="IconHome" size={24} />
```

## Token Usage in SCSS

### In `globals.scss`

Files with `:root` selectors (`_variables.scss`, `_fonts.scss`, `_reset.scss`, etc.) must be imported in `globals.scss`.

### In Component SCSS

Use the `pkg:` prefix for mixins. CSS variables are globally available:

```scss
// component.module.scss
@use 'pkg:@jaymantri/origin/tokens/text-styles' as *;

.title {
  @include headline-sm;
  color: var(--text-primary);  // tokens available globally
}
```

## App-Specific Tokens

If you need app-specific tokens or mixins, create them in a local `src/tokens/` folder:

```scss
// src/tokens/_forms.scss (app-specific)
@mixin form-controls {
  input:not([type="checkbox"]) {
    width: 100%;
  }
}

// component.module.scss
@use '../tokens/forms' as *;  // local
@use 'pkg:@jaymantri/origin/tokens/text-styles' as *;  // from Origin
```

## Sync

Tokens are imported directly from the package — no manual copying needed. When Origin publishes a new version:

```bash
npm install @jaymantri/origin@latest
```
