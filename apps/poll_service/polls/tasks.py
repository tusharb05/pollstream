from poll_service.celery import app
from .models import Poll
from django.utils.timezone import now
import logging

logger = logging.getLogger(__name__)

@app.task
def find_and_disable_expired_polls():
    expired = Poll.objects.filter(end_time__lte=now(), is_active=True)
    count = expired.update(is_active=False)
    logger.info("🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥")
    logger.info(f"{count} POLLS CLOSED")
    logger.info("🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥")    
    return f"{count} polls closed."    