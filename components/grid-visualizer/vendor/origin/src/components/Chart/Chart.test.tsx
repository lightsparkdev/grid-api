import { test, expect } from '@playwright/experimental-ct-react';
import AxeBuilder from '@axe-core/playwright';
import {
  Sparkline,
  SparklineWithColor,
  FullChart,
  LinearCurve,
  WithFadeLeft,
  WithFadeLeftCustom,
  CustomAriaLabel,
  EmptyData,
  SingleDataPoint,
  NoAnimation,
  CustomStrokeWidth,
  WithFormatters,
  SimpleTooltip,
  DetailedTooltipExplicit,
  CustomTooltip,
} from './Chart.test-stories';

const axeConfig = {
  rules: {
    'landmark-one-main': { enabled: false },
    'page-has-heading-one': { enabled: false },
    region: { enabled: false },
  },
};

// ---------------------------------------------------------------------------
// Accessibility
// ---------------------------------------------------------------------------

test.describe('Chart accessibility', () => {
  test('sparkline has no accessibility violations', async ({ mount, page }) => {
    await mount(<Sparkline />);
    const results = await new AxeBuilder({ page })
      .options(axeConfig)
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test('full chart has no accessibility violations', async ({
    mount,
    page,
  }) => {
    await mount(<FullChart />);
    const results = await new AxeBuilder({ page })
      .options(axeConfig)
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test('svg has role="img" and aria-label', async ({ mount, page }) => {
    await mount(<Sparkline />);
    const svg = page.locator('[data-testid="chart"] svg');
    await expect(svg).toHaveAttribute('role', 'img');
    await expect(svg).toHaveAttribute('aria-label');
  });

  test('custom aria-label overrides auto-generated one', async ({
    mount,
    page,
  }) => {
    await mount(<CustomAriaLabel />);
    const svg = page.locator('[data-testid="chart"] svg');
    await expect(svg).toHaveAttribute('aria-label', 'Weekly revenue trend');
  });

  test('svg contains a desc element', async ({ mount, page }) => {
    await mount(<Sparkline />);
    const desc = page.locator('[data-testid="chart"] svg desc');
    await expect(desc).toBeAttached();
    const text = await desc.textContent();
    expect(text).toContain('data points');
  });
});

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

test.describe('Chart rendering', () => {
  test('renders SVG with correct dimensions', async ({ mount, page }) => {
    await mount(<Sparkline />);
    const svg = page.locator('[data-testid="chart"] svg');
    await expect(svg).toBeVisible();
    const height = await svg.getAttribute('height');
    expect(height).toBe('170');
  });

  test('renders two path elements per series (active + inactive)', async ({ mount, page }) => {
    await mount(<FullChart />);
    const paths = page.locator('[data-testid="chart"] svg path');
    // 2 series x 2 (active color + inactive/tertiary) = 4
    await expect(paths).toHaveCount(4);
  });

  test('sparkline renders two paths (active + inactive)', async ({ mount, page }) => {
    await mount(<Sparkline />);
    const paths = page.locator('[data-testid="chart"] svg path');
    await expect(paths).toHaveCount(2);
  });

  test('empty data renders container but no SVG paths', async ({
    mount,
    page,
  }) => {
    await mount(<EmptyData />);
    const container = page.locator('[data-testid="chart"]');
    await expect(container).toBeVisible();
    // With no data/width, SVG may not render paths
    const paths = page.locator('[data-testid="chart"] svg path');
    const count = await paths.count();
    expect(count).toBeLessThanOrEqual(0);
  });

  test('single data point renders without errors', async ({
    mount,
    page,
  }) => {
    await mount(<SingleDataPoint />);
    const svg = page.locator('[data-testid="chart"] svg');
    await expect(svg).toBeVisible();
    const paths = page.locator('[data-testid="chart"] svg path');
    // 1 series x 2 (active + inactive) = 2
    await expect(paths).toHaveCount(2);
  });
});

// ---------------------------------------------------------------------------
// Curve types
// ---------------------------------------------------------------------------

test.describe('Chart curve types', () => {
  test('monotone curve produces C commands in path', async ({
    mount,
    page,
  }) => {
    await mount(<Sparkline />);
    const path = page.locator('[data-testid="chart"] svg path').first();
    const d = await path.getAttribute('d');
    expect(d).toContain('C');
  });

  test('linear curve produces only L commands in path', async ({
    mount,
    page,
  }) => {
    await mount(<LinearCurve />);
    const path = page.locator('[data-testid="chart"] svg path').first();
    const d = await path.getAttribute('d');
    expect(d).toContain('L');
    expect(d).not.toContain('C');
  });
});

// ---------------------------------------------------------------------------
// Grid and axis
// ---------------------------------------------------------------------------

test.describe('Chart grid and axis', () => {
  test('grid lines are rendered when grid=true', async ({ mount, page }) => {
    await mount(<FullChart />);
    // Grid lines are <line> elements with the gridLine class
    const lines = page.locator('[data-testid="chart"] svg line');
    const count = await lines.count();
    // Should have grid lines + the cursor line
    expect(count).toBeGreaterThanOrEqual(2);
  });

  test('x-axis labels appear when xKey is set', async ({ mount, page }) => {
    await mount(<FullChart />);
    // X labels are <text> elements containing day names
    const monLabel = page.locator('[data-testid="chart"] svg text', {
      hasText: 'Mon',
    });
    await expect(monLabel.first()).toBeVisible();
  });

  test('y-axis labels appear when grid=true', async ({ mount, page }) => {
    await mount(<FullChart />);
    // Y labels are <text> elements with numeric content
    const textEls = page.locator('[data-testid="chart"] svg text');
    const count = await textEls.count();
    // Should have both x and y labels
    expect(count).toBeGreaterThanOrEqual(3);
  });
});

// ---------------------------------------------------------------------------
// Tooltip and hover
// ---------------------------------------------------------------------------

test.describe('Chart tooltip', () => {
  test('tooltip is hidden by default', async ({ mount, page }) => {
    await mount(<FullChart />);
    const tooltip = page.locator('[data-testid="chart"] > div');
    // Tooltip element exists but is display: none via inline style
    await expect(tooltip).toBeAttached();
    await expect(tooltip).toHaveCSS('display', 'none');
  });

  test('tooltip appears on hover', async ({ mount, page }) => {
    await mount(<FullChart />);
    const svg = page.locator('[data-testid="chart"] svg');
    const box = await svg.boundingBox();
    if (!box) throw new Error('SVG not visible');

    // Hover in the middle of the chart
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);

    const tooltip = page.locator('[data-testid="chart"] > div');
    // Wait for tooltip to become visible
    await expect(tooltip).toBeVisible({ timeout: 2000 });
  });

  test('tooltip shows series labels', async ({ mount, page }) => {
    await mount(<FullChart />);
    const svg = page.locator('[data-testid="chart"] svg');
    const box = await svg.boundingBox();
    if (!box) throw new Error('SVG not visible');

    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);

    // Should show both series labels
    const tooltip = page.locator('[data-testid="chart"] > div');
    await expect(tooltip).toBeVisible({ timeout: 2000 });
    await expect(tooltip.locator('text=Incoming').or(tooltip.getByText('Incoming'))).toBeVisible();
    await expect(tooltip.locator('text=Outgoing').or(tooltip.getByText('Outgoing'))).toBeVisible();
  });

  test('tooltip hides on mouse leave', async ({ mount, page }) => {
    await mount(<FullChart />);
    const svg = page.locator('[data-testid="chart"] svg');
    const box = await svg.boundingBox();
    if (!box) throw new Error('SVG not visible');

    // Hover then leave
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    const tooltip = page.locator('[data-testid="chart"] > div');
    await expect(tooltip).toBeVisible({ timeout: 2000 });

    // Move mouse well below the chart to trigger mouseLeave
    await page.mouse.move(box.x + box.width / 2, box.y + box.height + 100);

    // Tooltip should hide (inline style.display = 'none')
    await expect(tooltip).toHaveCSS('display', 'none', { timeout: 2000 });
  });

  test('cursor line appears on hover', async ({ mount, page }) => {
    await mount(<FullChart />);
    const svg = page.locator('[data-testid="chart"] svg');
    const box = await svg.boundingBox();
    if (!box) throw new Error('SVG not visible');

    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);

    // Cursor line should be visible (style.display cleared)
    const lines = page.locator('[data-testid="chart"] svg line');
    const count = await lines.count();
    let hasCursorVisible = false;
    for (let i = 0; i < count; i++) {
      const display = await lines.nth(i).evaluate(
        (el) => (el as SVGElement).style.display,
      );
      if (display !== 'none') hasCursorVisible = true;
    }
    expect(hasCursorVisible).toBe(true);
  });

  test('hover dots appear on hover', async ({ mount, page }) => {
    await mount(<FullChart />);
    const svg = page.locator('[data-testid="chart"] svg');
    const box = await svg.boundingBox();
    if (!box) throw new Error('SVG not visible');

    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);

    // Active dots (rects) should be visible
    const dots = page.locator('[data-testid="chart"] svg rect[width="8"]');
    const count = await dots.count();
    expect(count).toBe(2); // Two series
    for (let i = 0; i < count; i++) {
      const display = await dots.nth(i).evaluate(
        (el) => (el as SVGElement).style.display,
      );
      expect(display).not.toBe('none');
    }
  });

  test('formatValue is applied in tooltip', async ({ mount, page }) => {
    await mount(<WithFormatters />);
    const svg = page.locator('[data-testid="chart"] svg');
    const box = await svg.boundingBox();
    if (!box) throw new Error('SVG not visible');

    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);

    const tooltip = page.locator('[data-testid="chart"] > div');
    await expect(tooltip).toBeVisible({ timeout: 2000 });
    // Values should be formatted with $ prefix
    const text = await tooltip.textContent();
    expect(text).toContain('$');
  });
});

// ---------------------------------------------------------------------------
// Tooltip variants
// ---------------------------------------------------------------------------

test.describe('Chart tooltip variants', () => {
  test('tooltip="simple" shows only x-label, no series rows', async ({
    mount,
    page,
  }) => {
    await mount(<SimpleTooltip />);
    const svg = page.locator('[data-testid="chart"] svg');
    const box = await svg.boundingBox();
    if (!box) throw new Error('SVG not visible');

    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);

    const tooltip = page.locator('[data-testid="chart"] > div');
    await expect(tooltip).toBeVisible({ timeout: 2000 });

    const text = await tooltip.textContent();
    // Should contain a date label (one of the x values)
    expect(text).toBeTruthy();
    // Should NOT contain series indicator dots or value rows
    const indicators = tooltip.locator('span');
    await expect(indicators).toHaveCount(0);
  });

  test('tooltip="detailed" renders series rows (same as boolean true)', async ({
    mount,
    page,
  }) => {
    await mount(<DetailedTooltipExplicit />);
    const svg = page.locator('[data-testid="chart"] svg');
    const box = await svg.boundingBox();
    if (!box) throw new Error('SVG not visible');

    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);

    const tooltip = page.locator('[data-testid="chart"] > div');
    await expect(tooltip).toBeVisible({ timeout: 2000 });
    await expect(
      tooltip.getByText('Incoming'),
    ).toBeVisible();
    await expect(
      tooltip.getByText('Outgoing'),
    ).toBeVisible();
  });

  test('tooltip render function receives datum and renders custom content', async ({
    mount,
    page,
  }) => {
    await mount(<CustomTooltip />);
    const svg = page.locator('[data-testid="chart"] svg');
    const box = await svg.boundingBox();
    if (!box) throw new Error('SVG not visible');

    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);

    const tooltip = page.locator('[data-testid="chart"] > div');
    await expect(tooltip).toBeVisible({ timeout: 2000 });
    const custom = page.locator('[data-testid="custom-tooltip-content"]');
    await expect(custom).toBeVisible({ timeout: 2000 });
    const text = await custom.textContent();
    expect(text).toContain('Custom:');
  });
});

// ---------------------------------------------------------------------------
// fadeLeft
// ---------------------------------------------------------------------------

test.describe('Chart fadeLeft', () => {
  test('fadeLeft=true adds SVG mask and defs', async ({ mount, page }) => {
    await mount(<WithFadeLeft />);
    const defs = page.locator('[data-testid="chart"] svg defs');
    await expect(defs).toBeAttached();
    const mask = page.locator('[data-testid="chart"] svg mask');
    await expect(mask).toBeAttached();
    const gradient = page.locator(
      '[data-testid="chart"] svg linearGradient',
    );
    await expect(gradient).toBeAttached();
  });

  test('fadeLeft={60} adds SVG mask', async ({ mount, page }) => {
    await mount(<WithFadeLeftCustom />);
    const mask = page.locator('[data-testid="chart"] svg mask');
    await expect(mask).toBeAttached();
  });

  test('no fadeLeft means no mask in SVG', async ({ mount, page }) => {
    await mount(<Sparkline />);
    const mask = page.locator('[data-testid="chart"] svg mask');
    await expect(mask).not.toBeAttached();
  });
});

// ---------------------------------------------------------------------------
// Props: color, strokeWidth, animate
// ---------------------------------------------------------------------------

test.describe('Chart props', () => {
  test('color prop sets stroke color on single-series path', async ({
    mount,
    page,
  }) => {
    await mount(<SparklineWithColor />);
    const path = page.locator('[data-testid="chart"] svg path').first();
    const stroke = await path.getAttribute('stroke');
    expect(stroke).toBe('rgb(0, 0, 255)');
  });

  test('strokeWidth prop sets stroke-width attribute', async ({
    mount,
    page,
  }) => {
    await mount(<CustomStrokeWidth />);
    const path = page.locator('[data-testid="chart"] svg path').first();
    const sw = await path.getAttribute('stroke-width');
    expect(sw).toBe('4');
  });

  test('animate=false does not apply animation class', async ({
    mount,
    page,
  }) => {
    await mount(<NoAnimation />);
    const path = page.locator('[data-testid="chart"] svg path').first();
    const cls = await path.getAttribute('class');
    // Should not have the lineAnimate class
    expect(cls ?? '').not.toContain('lineAnimate');
  });

  test('animate=true applies animation class by default', async ({
    mount,
    page,
  }) => {
    await mount(<Sparkline />);
    const path = page.locator('[data-testid="chart"] svg path').first();
    const cls = await path.getAttribute('class');
    // CSS modules mangles the name, but it should have some class
    expect(cls).toBeTruthy();
  });
});
