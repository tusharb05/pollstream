import os
from vote_service.celery import app
from django.conf import settings
from .models import VoteLog
from .producer import publish_vote_to_poll_service
import logging

logger = logging.getLogger(__name__)


@app.task(bind=True, acks_late=True)
def process_vote(self, poll_id, option_id, voter_name):
    try:
        # 🔍 Check if this voter already voted in the given poll
        if VoteLog.objects.filter(poll_id=poll_id, voter_name=voter_name).exists():
            logger.info(f"Duplicate vote detected for voter '{voter_name}' in poll {poll_id}")
            return "Duplicate vote detected - ignored"

        # 🧾 Log the vote in the database
        VoteLog.objects.create(
            poll_id=poll_id,
            option_id=option_id,
            voter_name=voter_name
        )
        logger.info(f"Vote logged for poll {poll_id}, option {option_id}, voter '{voter_name}'")

        # 📤 Notify poll_service via RabbitMQ
        publish_vote_to_poll_service({
            "voter_name": voter_name,
            "poll_id": poll_id,
            "option_id": option_id,
            "delta": 1
        })
        logger.info("Vote successfully recorded and published")

        return "Vote successfully recorded and published"

    except Exception as e:
        logger.exception("Error in process_vote – retrying")
        self.retry(exc=e, countdown=2 ** self.request.retries)
        raise
