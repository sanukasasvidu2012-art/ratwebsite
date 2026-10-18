# Device Control Dashboard

A standalone React + TypeScript + Vite + Tailwind CSS administration console for transparent, owner-approved Android device enrollment and inventory management.

This repository contains **only the website**. It does not include an Android app or a backend service.

## Features

- Responsive dark administration UI with overview metrics and device inventory
- Searchable devices and device detail pages
- Visible enrollment workflow with time-limited pairing-code UI
- Workspace members and role assignment UI
- Searchable audit log with CSV export
- Settings, account controls, and security checklist
- Typed FastAPI API client with bearer-token support, credentials, errors, and loading states
- WebSocket status monitor with reconnect attempts
- Demo mode so the website can be previewed without a running API

## Requirements

- Node.js 20 or later recommended
- npm 10 or later

## Run locally

```bash
npm install
cp .env.example .env
npm run dev
```

Open the URL printed by Vite (usually `http://localhost:5173`).

On Windows PowerShell, copy the environment file with:

```powershell
Copy-Item .env.example .env
```

Demo mode is enabled by default. The demo login accepts any non-empty email and password. It uses sample records and is **not authentication**; never deploy demo mode publicly.

## Production API configuration

Edit `.env`:

```dotenv
VITE_API_BASE_URL=https://api.example.com/api
VITE_DEMO_MODE=false
```

Restart Vite after changing environment variables. `VITE_` variables are embedded in the browser bundle and are not secrets. Never put API keys, private keys, or backend credentials in this file.

## Expected FastAPI endpoints

The client uses the following API shape when demo mode is disabled:

| Method | Path | Expected response / purpose |
|---|---|---|
| POST | `/auth/login` | `{ "accessToken": "...", "user": { "id", "name", "email", "role" } }` |
| POST | `/auth/logout` | End/revoke current session |
| GET | `/dashboard/summary` | `{ "totalDevices", "onlineDevices", "offlineDevices", "pendingDevices" }` |
| GET | `/devices` | `Device[]` |
| GET | `/devices/{id}` | `Device` |
| POST | `/devices/{id}/revoke` | Revoke a device enrollment |
| POST | `/enrollment/codes` | `{ "code", "expiresAt", "expiresInSeconds" }`; request body `{ "ttl_seconds": 600 }` |
| GET | `/users` | `TeamMember[]` |
| PATCH | `/users/{id}/role` | Request body `{ "role": "Administrator" }` |
| GET | `/audit-logs` | `AuditEvent[]` |
| WS | `/ws/status` | Authenticated live status notifications |

The frontend types are in `src/types.ts`; endpoint calls live in `src/lib/api.ts`. Adjust mappings to match your actual API schema.

### Suggested JSON fields

**Device**
```json
{
  "id": "dev-1048",
  "name": "Warehouse Tablet 04",
  "model": "Samsung Galaxy Tab Active4 Pro",
  "androidVersion": "Android 14",
  "status": "Online",
  "battery": 87,
  "network": "Wi-Fi · 5 GHz",
  "lastSync": "Just now",
  "owner": "Operations"
}
```

**Audit event**
```json
{
  "id": "evt-8214",
  "actor": "Alex Morgan",
  "action": "Device synchronized",
  "target": "Warehouse Tablet 04",
  "ip": "10.0.12.24",
  "createdAt": "2026-10-18 08:42:15",
  "result": "Success"
}
```

## Authentication and security notes

This is a **frontend project**, not a complete security boundary. The production API must enforce all authorization server-side.

Before deployment:

1. Replace demo authentication with your identity provider or secure FastAPI auth implementation.
2. Prefer secure, HttpOnly, SameSite cookies for browser sessions. If using bearer tokens, keep access tokens short-lived and carefully assess browser storage risks.
3. Implement `/auth/me` or another session hydration mechanism. This starter currently hydrates a session only in demo mode after a page refresh.
4. Add CSRF protection when cookie-based auth is used.
5. Enforce HTTPS and secure WebSocket (`wss://`) in production.
6. Authenticate WebSocket connections and validate allowed origins.
7. Implement role-based authorization on every protected API operation, not just the UI.
8. Create pairing codes server-side using cryptographically secure randomness, store only a hash, enforce expiration and single-use, rate-limit attempts, and audit creation/consumption.
9. Ensure device revocation invalidates server-side credentials and writes an immutable audit event.
10. Configure restrictive CORS, CSP/security headers, rate limiting, logging redaction, dependency scanning, and backups.
11. Never collect personal content or access sensors covertly. Keep enrollment and revocation visible and owner-approved.

The pairing code shown in demo mode is generated locally for UI preview only. The preferences page is also local UI state; it does not save settings to an API.

## Build and type-check

```bash
npm run typecheck
npm run build
npm run preview
```

Build output is written to `dist/`.

## Project structure

```text
src/
  components/  Reusable layout, status, card, loading, and form components
  lib/         Typed API client and WebSocket status hook
  pages/       Overview, devices, detail, enrollment, users, audit, settings, login
  App.tsx
  main.tsx
  styles.css
```

## License

Choose and add a license before redistributing.
