import os
from celery import Celery

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "poll_service.settings")

# Use RabbitMQ as the broker
app = Celery("poll_service", broker=os.getenv("RABBITMQ_URL"))

app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks()
