#!/bin/bash
set -e

echo "Waiting for PostgreSQL on $DATABASE_HOST:$DATABASE_PORT..."

: "${DATABASE_HOST:=postgres}"
: "${DATABASE_PORT:=5432}"

# Wait for PostgreSQL
python << END
import socket, time, os
host = os.getenv("DATABASE_HOST", "postgres")
port = int(os.getenv("DATABASE_PORT", 5432))
for i in range(30):
    try:
        with socket.create_connection((host, port), timeout=2):
            print("PostgreSQL is available!")
            break
    except OSError as e:
        print(f"PostgreSQL unavailable ({e}) - sleeping")
else:
    print("Error: Could not connect to PostgreSQL after 30 tries.")
    exit(1)
END

echo "⏳ Waiting for RabbitMQ and Redis..."
: "${RABBITMQ_HOST:=rabbitmq}"
: "${RABBITMQ_PORT:=5672}"
until nc -z "$RABBITMQ_HOST" "$RABBITMQ_PORT"; do
  sleep 1
done

: "${REDIS_HOST:=redis}"
: "${REDIS_PORT:=6379}"
until nc -z "$REDIS_HOST" "$REDIS_PORT"; do
  sleep 1
done

if [ "$RUN_MIGRATIONS" = "true" ]; then
  echo "Running migrations..."
  python manage.py makemigrations
  python manage.py migrate
  echo "Migrations done. Exiting."
  exit 0
fi

# Run app
echo "Starting application..."
exec "$@"
