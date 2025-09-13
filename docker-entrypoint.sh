#!/bin/sh
set -e

echo "[entrypoint] Running Prisma migrate deploy..."
npx prisma migrate deploy

echo "[entrypoint] Running Prisma generate..."
npx prisma generate

echo "[entrypoint] Starting Next.js server..."
exec node server.js

