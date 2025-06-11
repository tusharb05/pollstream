# syntax=docker/dockerfile:1

# ---------- Base Python Image ----------
FROM python:3.11-slim AS base

# ---------- Set Environment Variables ----------
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# ---------- Set Working Directory ----------
WORKDIR /app

# ---------- Install System Dependencies ----------
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    netcat-openbsd \
    && rm -rf /var/lib/apt/lists/*

# ---------- Install Python Dependencies ----------
COPY requirements.txt .
RUN pip install --upgrade pip && pip install -r requirements.txt

# ---------- Copy Project Code ----------
COPY . .

# ---------- Copy and Set Entrypoint ----------
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh
ENTRYPOINT ["/app/entrypoint.sh"]

# ---------- Default Command ----------
CMD ["gunicorn", "poll_service.wsgi:application", "--bind", "0.0.0.0:8001"]