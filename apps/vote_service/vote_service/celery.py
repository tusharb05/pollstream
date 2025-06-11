import os
from celery import Celery

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "vote_service.settings")
app = Celery("vote_service", broker=os.getenv("RABBITMQ_URL"))
app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks()
