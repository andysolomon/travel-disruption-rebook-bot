# Vercel API Proxy

Create a Vercel serverless function that proxies an external API, keeping secrets server-side.

## When to use

When a frontend app calls an external API using a secret key exposed via `VITE_*` env vars, and you need to move that key server-side.

## Steps

### 1. Create the serverless function

Create `api/<name>.ts` with:

```ts
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. Validate query params — return 400 if missing
  // 2. Read API key from process.env (server-only, no VITE_ prefix)
  // 3. Proxy the request to the upstream API
  // 4. Return JSON on success, 502 on upstream failure
}
```

Ensure `@vercel/node` is installed as a dev dependency.

### 2. Create `tsconfig.api.json`

Separate tsconfig targeting Node.js for the `api/` directory:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "outDir": "dist-api",
    "rootDir": "api"
  },
  "include": ["api/**/*.ts"]
}
```

Add it as a reference in `tsconfig.json`.

### 3. Update frontend code

- Remove `import.meta.env.VITE_*` references for the API key
- Change fetch calls to use the local proxy path (`/api/<name>?param=value`)
- Remove any `isRealApiAvailable()` guards — the proxy handles missing keys with a 502

### 4. Configure dev proxy in Vite

Add to `vite.config.ts`:

```ts
server: {
  proxy: {
    '/api': 'http://localhost:3000',
  },
},
```

Run `vercel dev` alongside `vite dev` during local development.

### 5. Rename environment variables

- `.env` / `.env.example`: rename `VITE_<KEY>` → `<KEY>` (drop the `VITE_` prefix)
- In Vercel dashboard or CLI: add the renamed env var

### 6. Update tests

- Remove env var stubs (`import.meta.env.VITE_*`)
- Update fetch mock expectations to match the proxy URL (`/api/<name>?param=value`)
- Remove tests for "no API key" since that's now server-side

### 7. Verify

- `bun run test` — all unit tests pass
- `vercel dev` — local dev serves both frontend and API
- Confirm the `VITE_*` key no longer appears in browser network tab
