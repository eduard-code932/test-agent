# Next.js Test Project

Minimal Next.js 16 + TypeScript scaffold for local engineering validation.

## Prerequisites

- Node.js `>=20.9.0` (recommended: current active LTS)
- npm (this project is npm-first and includes `package-lock.json`)

Check your versions:

```bash
node -v
npm -v
```

## Install

From this directory (`nextjs-test-project`):

```bash
npm install
```

If installation fails because of a transient network problem, retry:

```bash
npm install
```

## Run (development)

Default port 3000:

```bash
npm run dev
```

Alternate port if 3000 is already in use:

```bash
npm run dev -- --port 3001
```

Verify app is up:

- Open `http://localhost:3000` (or your alternate port)
- The page should show: **Next.js Test Project**

## Production build + start

Build:

```bash
npm run build
```

Start production server:

```bash
npm run start
```

Run production server on an alternate port:

```bash
npm run start -- --port 3001
```

## Common setup edge cases

1. **Existing target directory already present (when re-scaffolding)**
   - Deterministic behavior: do not scaffold into an existing folder.
   - Example:
     ```bash
     [ -e "nextjs-test-project" ] && echo "Target directory exists. Choose a new name or remove it." && exit 1
     ```
2. **Unsupported Node.js version**
   - Upgrade Node.js to a supported version (`>=20.9.0`) before running install/build/start.
3. **Package installation/network failure**
   - Retry `npm install`; if needed, clear cache with `npm cache verify` and retry.
4. **Default port already in use**
   - Use `--port` as shown above.
5. **Package-manager command mismatch**
   - Use npm commands for this repo (`package-lock.json` is committed).
   - Avoid mixing package managers in the same working tree.
