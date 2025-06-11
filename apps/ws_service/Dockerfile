FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Install netcat for health-checks
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       netcat-openbsd \
       iproute2 \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project
COPY . .

# Make entrypoint executable
RUN chmod +x entrypoint.sh

# Expose ASGI port
EXPOSE 8000

ENTRYPOINT ["./entrypoint.sh"]
