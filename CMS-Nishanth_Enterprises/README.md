# CMS Nishanth Enterprises (Full-Stack)

This folder contains a clean separation of:

- `backend/` : Node.js + Express + PostgreSQL (JWT auth, DB health check)
- `frontend/` : Next.js (Login UI enabled only when backend DB health is `ok`)

## Prerequisites

- Node.js 18+
- PostgreSQL

## PostgreSQL setup

1. Create a database (example: `cmsdb`)
2. Ensure it’s reachable from the backend via `DATABASE_URL`

## Backend setup

1. Go to `backend/`
2. Copy env file:
   - `backend/.env.example` -> `backend/.env`
3. Configure:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `AUTH_ADMIN_EMAIL`
   - `AUTH_ADMIN_PASSWORD_HASH` (recommended)  
     Generate a hash:
     ```bash
     node -e "console.log(require('bcryptjs').hashSync('YOUR_PASSWORD', 10))"
     ```
4. Start:
   ```bash
   npm install
   npm run dev
   ```

### Endpoints

- `GET /api/health` — public liveness check
- `GET /api/db-health-check` (requires `Authorization: Bearer <token>`)
  - `{ "status": "ok", "database": "connected" }` when DB is reachable
  - `{ "status": "error", "database": "disconnected" }` when DB is down
- `POST /api/auth/login`
  - Returns a JWT:
    ```json
    { "token": "....", "tokenType": "Bearer", "user": { "email": "..." } }
    ```

### CMS REST API (JWT required)

Apply schema from `backend/sql/pages.sql`, then use:

| Resource | Base path | Notes |
|----------|-----------|--------|
| Pages | `/api/pages` | CRUD; timestamps via DB triggers (`updated_at` not set in app code) |
| Sections | `/api/page-sections` | CRUD; validates `page_id` exists; cascade delete from `pages` |
| Images | `/api/page-images` | CRUD; `POST /api/page-images` JSON `{ section_id, image_url }` |
| Image upload | `POST /api/page-images/upload` | `multipart/form-data`: `section_id`, `image` — jpg/jpeg/png, max 1 MB; stored under `assets/{page}/{section}/` |

Static files: `GET /assets/...` (served from `ASSETS_ROOT`, default `./assets`).

**Postman:** import `backend/postman/Nishanth-CMS-API.postman_collection.json`. Set collection variable `base_url`, run **Auth → Login** to fill `token`.

## Frontend setup

1. Go to `frontend/`
2. Copy env file:
   - `frontend/.env.example` -> `frontend/.env.local`
3. Start:
   ```bash
   npm install
   npm run dev
   ```

### Login gating behavior

- On page load, the login page calls the backend `GET /api/db-health-check`.
- The login button stays disabled until the backend returns `status: "ok"`.

## Production build

- Backend: `npm run build` (then run `npm run start`)
- Frontend: `npm run build` (then run `npm start`)

