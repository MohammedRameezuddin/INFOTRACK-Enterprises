# Backend services for Infotrack

This workspace includes two lightweight skeleton services:

- `backend/api` — NestJS-style TypeScript API skeleton (sample `GET /products`).
- `backend/ai` — FastAPI AI engine skeleton (endpoints for `embed` and `search`).

Run locally with Docker Compose:

```bash
docker-compose up --build
```

Notes:
- These are minimal scaffolds. For production, add migrations, ORM (Prisma/TypeORM), authentication, and secure env handling.
- After scaffolding, I can wire the frontend to call `http://localhost:3000/products` and the AI endpoints.
