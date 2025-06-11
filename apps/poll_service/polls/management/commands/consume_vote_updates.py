import json
import os
import pika
import django
from django.core.management.base import BaseCommand
from django.db.models import F
from polls.models import Option
import logging
import redis
from polls.models import VoteLog
from django.db import transaction

logger = logging.getLogger(__name__)
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "poll_service.settings")
django.setup()


class Command(BaseCommand):
    help = "Consume vote updates from RabbitMQ and update poll_service DB"

    def handle(self, *args, **options):
        # Connection parameters
        url = os.getenv("RABBITMQ_URL", "amqp://user:pass@rabbitmq:5672/")
        params = pika.URLParameters(url)

        connection = pika.BlockingConnection(params) 
        channel = connection.channel()
        print("\n\n\nDEBUG: Inside consume_vote_updates")
        # logger.info("hi from command")
        # Declare exchange & a dedicated queue
        channel.exchange_declare(exchange="poll_updates", exchange_type="direct", durable=True)
        q = channel.queue_declare(queue="poll_vote_updates", durable=True)
        channel.queue_bind(queue="poll_vote_updates",
                           exchange="poll_updates",
                           routing_key="poll.vote_update")

        self.stdout.write(self.style.SUCCESS(" [*] Waiting for vote update messages. To exit press CTRL+C"))

        def callback(ch, method, properties, body):
            try:
                data = json.loads(body)
                poll_id = data["poll_id"]
                option_id = data["option_id"]
                delta = data.get("delta", 1)
                voter_name = data["voter_name"]
                logger.info("🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥")
                logger.info(voter_name)
                with transaction.atomic():
                    # Atomically increment vote_count
                    updated = Option.objects.filter(id=option_id, poll_id=poll_id) \
                                            .update(vote_count=F('vote_count') + delta)

                    if updated == 0:
                        raise ValueError("Option not found or mismatch in poll_id/option_id.")

                    # Fetch updated option and related poll
                    option = Option.objects.select_related("poll").get(id=option_id, poll_id=poll_id)
                    poll = option.poll

                    # ✅ Insert into VoteLog
                    VoteLog.objects.create(
                        poll_id=poll,
                        option_id=option,
                        voter_name=voter_name
                    )

                self.stdout.write(f" [x] Updated Option {option_id} (+{delta})")

                # Prepare enriched vote message
                enriched_event = {
                    "poll_id": poll_id,
                    "option_id": option_id,
                    "poll_text": poll.title,
                    "option_text": option.text,
                    "voter_name": voter_name,
                }

                # Publish to Redis Pub/Sub (outside transaction, since it's external)
                redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
                redis_client = redis.from_url(redis_url)
                redis_client.publish("global:votes", json.dumps(enriched_event))

                ch.basic_ack(delivery_tag=method.delivery_tag)

            except Exception as e:
                self.stderr.write(f" [!] Failed to process message: {e}")
                ch.basic_nack(delivery_tag=method.delivery_tag, requeue=True)

        channel.basic_qos(prefetch_count=1)
        channel.basic_consume(queue="poll_vote_updates", on_message_callback=callback)
        channel.start_consuming()
