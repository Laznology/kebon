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
    
    if [ $? -eq 0 ]; then
      echo "Migrations applied successfully."
      echo "Running Prisma database seed..."
      npx --yes tsx prisma/seed.ts
      
      if [ $? -eq 0 ]; then
        echo "Seed completed successfully."
      else
        echo "Warning: Seed failed, but continuing startup..."
      fi
    else
      echo "Warning: Migration failed, skipping seed..."
    fi
  fi
else
  echo "SKIP_DB_SEED set; skipping Prisma migrate/seed."
fi

exec "$@"
