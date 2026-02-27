# Testing Guide

## TDD Workflow

Tests are written **before** implementation:

1. **Define API** — props, variants, states from Figma analysis
2. **Write test-stories.tsx** — test fixtures for each variant/state
3. **Write test.tsx** — Playwright CT tests including:
   - Behavior tests (interactions, states)
   - Conformance tests (slot compatibility — see below)
4. **Implement component** — make tests pass
5. **Run tests** — `npm run test`
6. **Run production build** — `npm run build` (catches strict TypeScript errors)

## Overview

Origin uses a two-layer testing system:

| Layer | Tool | Speed | Use For |
|-------|------|-------|---------|
| Integration | Playwright CT | ~200ms/test | DOM, accessibility, keyboard, interactions |
| Unit | Vitest | ~5ms/test | Complex logic only |

## Commands

```bash
npm run test           # Playwright CT (primary)
npm run test:unit      # Vitest unit tests
npm run test:all       # Both
npm run test:ui        # Playwright interactive UI
npm run test:unit:watch # Vitest watch mode
```

## When to Use Each

### Playwright CT (Default)

Use for **all components**. Tests run in a real browser.

```tsx
import { test, expect } from '@playwright/experimental-ct-react';
import { MyComponent } from './';

test('renders correctly', async ({ mount, page }) => {
  await mount(<MyComponent />);
  const element = page.getByRole('button');
  await expect(element).toBeVisible();
});
```

**Good for:**
- Verifying DOM structure
- Accessibility tree
- Keyboard navigation
- Focus management
- Computed styles
- User interactions

### Vitest Unit Tests (When Needed)

Use **only** when there's complex logic to test in isolation:

- State machines
- Date/time calculations
- Filtering/sorting algorithms
- Utility functions
- Complex hooks

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MyComponent } from './';

describe('MyComponent', () => {
  it('calculates next month correctly', () => {
    // Test pure logic
  });
});
```

**File naming:** `*.unit.test.tsx` (excluded from Playwright)

## Test File Structure

```
src/components/MyComponent/
├── MyComponent.tsx
├── MyComponent.module.scss
├── MyComponent.test.tsx         # Playwright CT (required)
├── MyComponent.unit.test.tsx    # Vitest (only if needed)
├── MyComponent.test-stories.tsx # Test fixtures
├── MyComponent.stories.tsx
└── index.ts
```

## Conformance Tests (Slot Compatibility)

**All components** must pass conformance tests to ensure slot compatibility with Base UI's `render` prop. Use the utility:

```tsx
import { createConformanceTests } from '@/test-utils';

const conformance = createConformanceTests({
  Component: MyComponent,
  requiredProps: { children: 'Label' },
  expectedTag: 'button',
});

test.describe('MyComponent conformance', () => {
  test('forwards props', async ({ mount, page }) => {
    await mount(<conformance.PropForwarding />);
    await expect(page.getByTestId(conformance.testId)).toHaveAttribute('data-custom', 'custom-value');
  });

  test('forwards ref', async ({ mount, page }) => {
    await mount(<conformance.RefForwarding />);
    await expect(page.getByTestId(conformance.testId)).toBeVisible();
  });

  test('merges className', async ({ mount, page }) => {
    await mount(<conformance.ClassNameString />);
    await expect(page.getByTestId(conformance.testId)).toHaveClass(/custom-class-name/);
  });

  test('forwards style', async ({ mount, page }) => {
    await mount(<conformance.StyleForwarding />);
    await expect(page.getByTestId(conformance.testId)).toHaveCSS('color', 'rgb(0, 128, 0)');
  });
});
```

See `slots.mdc` for the implementation pattern these tests verify.

## Decision Tree

```
Building a component?
│
├── All components:
│   └── Playwright CT + Conformance tests (slot compatibility)
│
├── Is it a Base UI wrapper? (Path A/B)
│   └── Behavior tests for exposed props/states
│
└── Is it custom? (Path C)
    └── Does it have complex logic?
        ├── Yes → Add Vitest unit tests
        └── No → Playwright CT only
```

## Tips

1. **Prefer `page` over `component`** for locating elements in Playwright CT
2. **Use `getByRole`** for accessibility-first testing
3. **Test behavior, not implementation** - test what users see/do
4. **Skip unit tests** unless you have complex logic to isolate

## Pre-Commit Verification

**Always run production build before committing:**

```bash
npm run build
```

Dev mode TypeScript is lenient. Production builds are stricter and catch:
- Props passed to components that don't accept them
- Element type mismatches (`HTMLDivElement` vs `HTMLSpanElement`)
- Import resolution issues

This prevents deployment failures from TypeScript errors.
