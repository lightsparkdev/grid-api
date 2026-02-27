# Component Reference

Reference material for the `/build-component` workflow.

## Composition Examples

| Component | Composition |
|-----------|-------------|
| SearchInput | `Input` + `Button` |
| Combobox | `Input` + `Popover` + `Menu` |
| Modal Stepper | `Dialog` + step state |
| Dropdown Button | `Button` + `Menu` |
| Date Picker | `Input` + `Popover` + calendar grid |
| Chip (dismissible) | `<span>` + `Button` (dismiss) |

## Figma Tooling

| Tool | Use | When |
|------|-----|------|
| `get_screenshot` | Visual reference | Always first |
| `get_metadata` | Layer hierarchy, variants | Complex components |
| `get_variable_defs` | Which values are tokenized | Always |
| `get_design_context` | CSS extraction | Each variant separately |

Fallback for CSS: `npm run figma:node "<figma-url>"`

## Rules Reference

| Scenario | Rule File |
|----------|-----------|
| Figma extraction | `figma-analysis.mdc` |
| Base UI exists | `components.mdc` |
| Composed from Base UI | `components.mdc` |
| No Base UI | `custom-components.mdc` |
| Animations | `motion.mdc` |

## Code Style

- Add Figma URL as first line of SCSS: `// Figma: https://figma.com/design/...`
- No decorative comment dividers
- No verbose headers or token lists
- No emojis in code or console output
- Code is self-documenting
