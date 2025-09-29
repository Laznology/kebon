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
    echo "DATABASE_URL not set; skipping Prisma seed."
  else
    echo "Running Prisma database seed..."
    npx --yes prisma db seed
    echo "Prisma seed completed."
  fi
else
  echo "SKIP_DB_SEED set; skipping Prisma seed."
fi

exec "$@"
