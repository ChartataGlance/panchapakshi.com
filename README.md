# panchapakshi.com

Hostinger-ready Node.js Panchapakshi app.

## Stack

- Backend: Hono
- Frontend: plain HTML/CSS/JS
- Runtime: Node.js >= 18

No Python/FastAPI and no `swetest` dependency. Tithi and sunrise/sunset are calculated with lightweight JavaScript approximations.

## Run locally

```bash
npm install
npm start
```

Open:

```text
http://localhost:3000
```

## API

```text
GET /api/panchapakshi?date=2026-06-13&time=12:00&lat=13.0827&lon=80.2707
GET /api/tables
GET /health
```

## Hostinger

Use Node.js app deployment.

Start command:

```bash
npm start
```

Entry file:

```text
src/server.js
```
