# Grid API Sample Frontend

Shared React frontend for the Grid API sample backends. Works with any backend that implements the [API contract](../README.md).

## Running

```bash
npm install
npm run dev
```

The dev server starts on [http://localhost:5173](http://localhost:5173) and proxies `/api` requests to `http://localhost:8080`.

## Configuring the Backend URL

If your backend runs on a different port, update the proxy target in `vite.config.ts`:

```typescript
proxy: {
  '/api': {
    target: 'http://localhost:YOUR_PORT',
  }
}
```

## Tech Stack

- React 18 + TypeScript
- Vite 6
- Tailwind CSS 4
