#!/bin/sh
set -e

should_seed() {
  case "${SKIP_DB_SEED}" in
    1|true|TRUE|True|yes|YES)
      return 1
      ;;
    *)
      return 0
      ;;
  esac
}

if should_seed; then
  if [ -z "${DATABASE_URL}" ]; then
    echo "DATABASE_URL not set; skipping Prisma migrate/seed."
  else
    echo "Applying Prisma migrations..."
    npx --yes prisma migrate deploy
    echo "Running Prisma database seed..."
    npm run db:seed
    echo "Prisma migrate & seed completed."
  fi
else
  echo "SKIP_DB_SEED set; skipping Prisma migrate/seed."
fi

exec "$@"
