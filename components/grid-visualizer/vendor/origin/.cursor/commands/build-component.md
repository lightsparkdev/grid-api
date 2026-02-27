# Build Component from Figma

## Process

1. Parse Figma URL → extract `fileKey`, `nodeId`

2. **Deep Figma analysis** — follow `figma-analysis.mdc`:
   - Screenshot → identify all states and variants
   - Metadata → understand layer hierarchy and auto-layout
   - Variable defs → identify which values are tokenized vs raw
   - Design context → extract CSS for EACH variant, not just parent
   - Output summary before proceeding

3. **Check Base UI** (start at https://base-ui.com/llms.txt) — follow decision tree:

   **A. Exact match exists?**
   - Yes → Use Base UI primitive, follow `components.mdc`
   
   **B. Can be composed from Base UI primitives?**
   - Example: SearchInput = `Input` + `Button`
   - Example: Combobox = `Input` + `Popover` + `Menu`
   - Yes → Compose from primitives (preferred over custom)
   
   **C. No Base UI solution?**
   > "No Base UI primitive or composition for this component.
   > 
   > Options:
   > 1. **Display-only** — Simple styled component (Badge, Card, etc.)
   > 2. **Interactive** — Needs research (Chip with dismiss, etc.)
   > 3. **Skip** — Don't build yet
   > 
   > Which approach?"
   
   - If **Display-only**: Follow `custom-components.mdc`, skip to step 6
   - If **Interactive**: Research first (WAI-ARIA APG, Radix, React Aria), then follow `custom-components.mdc`
   - If **Skip**: End process

4. **Define the API** — if using Base UI, list props that change behavior:
   > "Base UI offers these options for {Component}:
   > - `multiple`: Allow multiple items open (default: single)
   > - `disabled`: Disable interaction
   > 
   > Which behavior do you want as the default?"
   
   Wait for answer before proceeding.

5. **Write tests first** (TDD):
   
   Create test files before implementation:
   ```
   src/components/{Name}/
   ├── {Name}.test-stories.tsx   # Test fixtures (variants, states)
   ├── {Name}.test.tsx           # Playwright CT tests
   ```
   
   For Base UI wrappers:
   - Per behavioral prop: test both states
   - Controlled/uncontrolled: test both modes
   - Keyboard: Space, Enter, Arrows (as applicable)
   
   For custom components:
   - Core behavior
   - Keyboard accessibility
   - Disabled state
   - Any dismiss/action callbacks

6. **Create component** — make tests pass:
   ```
   src/components/{Name}/
   ├── {Name}.tsx or parts.tsx   # Implementation
   ├── {Name}.module.scss        # Styles
   └── index.ts                  # Exports
   ```

7. Mirror Figma exactly — if Figma uses a token, use it; if raw value, use that. **Check `figma-exceptions.mdc` for intentional deviations.**

8. Add `@media (prefers-reduced-motion: reduce)` for animations

9. **Run tests** — verify all pass before continuing:
   ```
   npm test -- src/components/{Name}/{Name}.test.tsx
   ```

10. **Fresh eyes review** — launch a subagent with NO prior context:
    
    Pass only the component files to the subagent (Task tool, `explore` type, `fast` model):
    ```
    src/components/{Name}/{Name}.tsx
    src/components/{Name}/{Name}.module.scss
    ```
    
    Subagent prompt:
    > "Review this component for simplicity. You have no context about the requirements.
    > 
    > Check for:
    > 1. Unnecessary props or logic
    > 2. Overly complex state handling
    > 3. Styles that could be simpler
    > 4. Anything confusing without context (bad naming, unclear purpose)
    > 
    > Be specific. If something looks fine, say so."
    
    Address feedback if valid, or note why it's intentional.

11. Create Storybook story with controlled example

12. **Update consumers** — add to `page.tsx` for demo

13. **Final verification:**
    - Add to `src/index.ts` — export component and types for package consumers
    - `npm run build` — catch export/import errors
    - `npm test` — full test suite

14. **Publish (if ready for Grid)**:
    > "Component is exported and tested. Ready to publish?
    > - Yes → Follow `publishing.mdc` to release a new version
    > - Not yet → Skip, publish later with other changes"

## Decision Tree

```
Figma URL
    │
    ▼
Deep Figma Analysis (figma-analysis.mdc)
    │
    ▼
Base UI Check (llms.txt)
    │
    ▼
A/B/C Path Decision
    │
    ▼
Define API (props, variants)
    │
    ▼
Write Tests First ← TDD
    │
    ▼
Implement Component (make tests pass)
    │
    ▼
Apply Figma Styling (check figma-exceptions.mdc)
    │
    ▼
Verify Tests Pass
    │
    ▼
Fresh Eyes Review ← subagent (no context)
    │
    ▼
Storybook + Demo
    │
    ▼
Export + Verify
    │
    ▼
Publish? (publishing.mdc)
```

## Reference

See `docs/component-reference.md` for:
- Composition examples
- Figma tooling details
- Rules reference
- Code style
