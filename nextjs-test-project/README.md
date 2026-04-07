# Next.js Sandbox Test Project

Minimal Next.js project for feature experiments and CI validation.

## Prerequisites

- Node.js `>=20.9.0` (LTS recommended, such as Node 22)
- npm (project is scaffolded and documented with npm)

Check versions:

```bash
node -v
npm -v
```

## Install

```bash
npm install
```

## Run locally

Start the dev server:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Production commands

Build:

```bash
npm run build
```

Start production server:

```bash
npm run start
```

Lint:

```bash
npm run lint
```

## CI / non-interactive usage

Use the same commands in CI:

```bash
npm ci
npm run lint
npm run build
```

## Troubleshooting

- **Node version mismatch**: Use Node `>=20.9.0`. If needed, switch to an LTS release (for example with `nvm use 22`).
- **Port 3000 already in use**: Run on a different port, for example:
  ```bash
  npm run dev -- --port 3001
  ```
- **Package manager mismatch**: This project is standardized on **npm**. Keep `package-lock.json` as the lockfile of record.
- **Restricted network / proxy installs**: Configure npm proxy settings before `npm install`:
  ```bash
  npm config set proxy http://<proxy-host>:<proxy-port>
  npm config set https-proxy http://<proxy-host>:<proxy-port>
  ```
  If your environment uses an internal registry, also set:
  ```bash
  npm config set registry https://<your-registry>
  ```
