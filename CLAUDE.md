# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the **Grid API** documentation repository. Grid is an API that enables modern financial institutions to send and receive global payments across fiat, stablecoins, and Bitcoin. The repository contains:

1. **OpenAPI specification** (split into modular YAML files)
2. **Mintlify documentation** (MDX files with guides, tutorials, and API reference)

This is a documentation-only repository - there is no application code.

## Common Commands

### Building and Linting

```bash
# Install dependencies
npm install
# or
make install

# Build OpenAPI schema (bundles split files into single openapi.yaml)
npm run build:openapi
# or
make build

# Lint OpenAPI schema and markdown files
npm run lint
# or
make lint

# Lint only OpenAPI
npm run lint:openapi
# or
make lint-openapi

# Lint only markdown
npm run lint:markdown
# or
make lint-markdown
```

### Documentation Development

```bash
# Serve Mintlify documentation locally (requires mint CLI installed globally)
cd mintlify && mint dev
# or
make mint
```

## Architecture

### OpenAPI Schema Structure

The OpenAPI specification uses a **split-file architecture** managed by Redocly:

- **Source files**: `openapi/` directory contains modular YAML files
  - `openapi/openapi.yaml` - Root specification with references
  - `openapi/paths/` - Endpoint definitions organized by domain
  - `openapi/components/schemas/` - Reusable schema definitions
  - `openapi/webhooks/` - Webhook event definitions

- **Built file**: `openapi.yaml` - Bundled specification at repository root (also copied to `mintlify/openapi.yaml`)

**Important**: When editing OpenAPI specs, edit files in `openapi/` directory, then run `npm run build:openapi` to bundle. The root `openapi.yaml` is generated and should not be edited directly.

### Domain Organization

The API is organized into four main use cases, reflected in both the OpenAPI paths and Mintlify docs:

1. **Payouts** - Send value instantly across currencies and borders
   - Customer management (`/customers`)
   - Internal accounts (`/customers/internal-accounts`, `/platform/internal-accounts`)
   - External accounts (`/customers/external-accounts`, `/platform/external-accounts`)
   - Quotes and transactions

2. **Ramps** - Convert between crypto and fiat
   - Customer onboarding with KYC
   - Plaid integration for bank account linking
   - Fiat-to-crypto and crypto-to-fiat conversion flows
   - Self-custody wallet support

3. **Rewards & Cashback** - Deliver micro-payouts at scale
   - Similar structure to Payouts
   - Optimized for high-volume, low-value transactions

4. **Global P2P (Remittances)** - Accept funds via bank transfers, wallets, or UMAs
   - User management with UMA addresses (`/users` endpoints in actual API)
   - UMA address resolution (`/receiver/uma/{receiverUmaAddress}`)
   - Payment approval/rejection flows
   - Invitations system (`/invitations`)

### Key Concepts

- **Customers**: End users of the platform (used in Payouts, Ramps, Rewards)
- **Users**: Distinction unclear from docs, but appears related to UMA-based flows
- **Internal Accounts**: Platform-managed accounts for holding funds
- **External Accounts**: Bank accounts connected for deposits/withdrawals
- **Quotes**: Time-limited exchange rate locks for cross-currency transactions
- **Transactions**: Payment records (incoming/outgoing)
- **UMA Addresses**: Universal Money Addresses (e.g., `$alice@example.com`) for P2P payments

### Mintlify Documentation Structure

- `mintlify/docs.json` - Navigation configuration with tabs for each use case
- `mintlify/index.mdx` - Landing page
- `mintlify/{use-case}/` - Use case-specific documentation
  - `index.mdx` - Use case overview
  - `quickstart.mdx` - Quick start guide
  - `onboarding/` or `developer-guides/` - Implementation guides
  - `accounts/`, `payment-flow/`, etc. - Topic-specific guides
- `mintlify/snippets/` - Reusable MDX snippets (imported into multiple docs)
- `mintlify/api-reference/` - API authentication and environment docs
- `mintlify/developer-resources/` - SDKs, tools, Postman collections
- `mintlify/changelog.mdx` - API changelog

### Shared Documentation Patterns

The repository uses **MDX snippets** to avoid duplication across use cases. Common snippets in `mintlify/snippets/`:

- `platform-config-currency-api-webhooks.mdx` - Platform configuration
- `internal-accounts.mdx` - Internal account management
- `external-accounts.mdx` - External account management
- `webhooks.mdx` - Webhook setup and verification
- `kyc-onboarding.mdx` - KYC onboarding process
- `plaid-integration.mdx` - Plaid integration
- `terminology.mdx` - Terminology definitions

Import these snippets rather than duplicating content.

## Authentication

The API uses HTTP Basic Authentication with format `<api token id>:<api client secret>` (Base64 encoded). All endpoints require authentication except the webhook endpoints (which use signature verification instead).

Webhooks use **P-256 ECDSA signatures** in the `X-Grid-Signature` header for verification.

## Important Notes

### OpenAPI Development

- Use Redocly for bundling and linting: `@redocly/cli`
- Configuration in `.redocly.yaml`
- Lint rules include operation descriptions, operation IDs, security definitions
- Always run `npm run lint:openapi` before committing OpenAPI changes

### Mintlify Development

- MDX files must include frontmatter with `title` and `description`
- Follow the writing standards in `mintlify/CLAUDE.md`
- Use second-person voice ("you")
- Test all code examples
- Use relative paths for internal links
- The mintlify subdirectory has its own CLAUDE.md with additional guidance

### Mintlify CLI Version (Important)

**Use Mintlify CLI version 4.2.284** for local development. Newer versions (e.g., 4.2.312) have a bug where the API reference pages render blank when using the palm theme with OpenAPI auto-generation.

**Requires Node.js LTS (v20 or v22)** - Mintlify does not support Node 25+. If you have a newer Node version installed, use Node 22 LTS:

```bash
# Install Node 22 via Homebrew (if needed)
brew install node@22

# Run mint dev with Node 22
export PATH="/opt/homebrew/opt/node@22/bin:$PATH"
cd mintlify && mint dev

# Or add to ~/.zshrc to make permanent:
# export PATH="/opt/homebrew/opt/node@22/bin:$PATH"
```

```bash
# Check current version
mintlify --version

# If needed, install the working version
npm install -g mintlify@4.2.284 --force
```

### Troubleshooting: API Reference Not Showing

If the API reference pages appear blank (only showing title and navigation, no endpoint details):

1. **Restart the dev server** - hot reload sometimes fails:
   ```bash
   pkill -f "mint.*dev"
   cd mintlify && mint dev
   ```

2. **Check CLI version** - ensure you're on 4.2.284 (see above)

3. **Verify OpenAPI spec** - run `mint openapi-check openapi.yaml` in the mintlify folder

### Documentation Philosophy

- **Document just enough** for user success - balance between too much and too little
- **Avoid duplication** - use snippets for shared content across use cases
- **Make content evergreen** when possible
- **Check existing patterns** for consistency before making changes
- **Search before adding** - look for existing information before creating new content

### CSS Styling Tips (Mintlify Overrides)

When overriding Mintlify's default styles in `mintlify/styles/base.css`:

- **Tailwind utility classes are hard to override directly** - Classes like `mb-3.5` have high specificity. Even with `!important` and complex selectors, they often won't budge.

- **Workaround: Use negative margins on sibling elements** - Instead of reducing `margin-bottom` on an element, add negative `margin-top` to the following sibling. This achieves the same visual effect.

- **Test selectors with visible properties first** - If a style isn't applying, add `border: 2px solid red !important;` to confirm the selector is matching. If the border shows, the selector works but something else is overriding your property.

- **HeadlessUI portal elements** - Mobile nav and modals render inside `#headlessui-portal-root`. Use this in selectors for higher specificity: `#headlessui-portal-root #mobile-nav ...`

- **Mobile nav lives in `#mobile-nav`** - Target mobile-specific styles with `#mobile-nav` or `div#mobile-nav` selectors to avoid affecting desktop sidebar.

- **Negative margins for edge-to-edge layouts** - To break out of parent padding (e.g., make nav items edge-to-edge), use negative margins equal to the parent's padding, then add your own padding inside.

### MDX Component Limitations

- **`React.useEffect` breaks the MDX parser** - Mintlify uses acorn to parse MDX, and it chokes on `useEffect`. Avoid using hooks that require cleanup or side effects.

- **`React.useState` works fine** - Simple state management is supported.

- **Keep components simple** - If you need complex interactivity, consider using CSS-only solutions or restructuring to avoid problematic hooks.

## Environments

- **Production**: `https://api.lightspark.com/grid/2025-10-13`
- **Sandbox**: Available for testing (see sandbox endpoints `/sandbox/send`, `/sandbox/receive`)

## Support

For questions or issues: support@lightspark.com
