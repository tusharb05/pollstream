#!/bin/sh
set -e

# Wait for Redis (and any other host:port pairs) to be ready
: "${REDIS_HOST:=redis}"
: "${REDIS_PORT:=6379}"
echo "Waiting for Redis at $REDIS_HOST:$REDIS_PORT..."
until nc -z "$REDIS_HOST" "$REDIS_PORT"; do
  sleep 1
done
echo "Redis is available."

# (Optional) Wait for other services similarly:
# until nc -z rabbitmq 5672; do sleep 1; done

# Run database migrations (if any)
echo "Applying Django migrations..."
python manage.py migrate --noinput

# Start Daphne ASGI server (which will also bootstrap your Redis subscriber thread)
echo "Starting Daphne server on :8000..."
exec daphne -b 0.0.0.0 -p 8000 ws_service.asgi:application
