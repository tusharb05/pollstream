#!/bin/sh
set -e

# Defaults (can be overridden by env vars)
: "${DATABASE_HOST:=vote_postgres}"
: "${DATABASE_PORT:=5432}"
: "${REDIS_HOST:=redis}"
: "${REDIS_PORT:=6379}"
: "${RABBIT_HOST:=rabbitmq}"
: "${RABBIT_PORT:=5672}"

echo "⏳ Waiting for PostgreSQL at $DATABASE_HOST:$DATABASE_PORT…"
until nc -z "$DATABASE_HOST" "$DATABASE_PORT"; do
  sleep 1
done
echo "✅ PostgreSQL is up"

echo "⏳ Waiting for Redis at $REDIS_HOST:$REDIS_PORT…"
until nc -z "$REDIS_HOST" "$REDIS_PORT"; do
  sleep 1
done
echo "✅ Redis is up"

echo "⏳ Waiting for RabbitMQ at $RABBIT_HOST:$RABBIT_PORT…"
until nc -z "$RABBIT_HOST" "$RABBIT_PORT"; do
  sleep 1
done
echo "✅ RabbitMQ is up"

echo "🚀 Running Django migrations…"
python manage.py makemigrations
python manage.py migrate --noinput

echo "▶️  Starting Gunicorn…"
exec "$@"
