# syntax=docker/dockerfile:1

FROM python:3.11-slim

# Prevent .pyc files & buffer stdout
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Install system deps (use netcat-openbsd instead of netcat)
RUN apt-get update && apt-get install -y \
      build-essential \
      libpq-dev \
      netcat-openbsd \
    && rm -rf /var/lib/apt/lists/*

# Install Python deps
COPY requirements.txt .
RUN pip install --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Copy code & entrypoint
COPY . .
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

# Launch script will wait for dependencies, run migrations, then start Gunicorn
ENTRYPOINT ["/app/entrypoint.sh"]
