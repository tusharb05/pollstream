import pika
import json
import os

import logging

logger = logging.getLogger(__name__)

def publish_vote_to_poll_service(data: dict):
    try:
        url = os.getenv("RABBITMQ_URL", "amqp://user:pass@rabbitmq:5672/")
        params = pika.URLParameters(url)

        connection = pika.BlockingConnection(params)
        channel = connection.channel()

        # Make exchange durable and match consumer
        channel.exchange_declare(exchange="poll_updates", exchange_type="direct", durable=True)

        # Publish with persistent delivery mode
        channel.basic_publish(
            exchange="poll_updates",
            routing_key="poll.vote_update",
            body=json.dumps(data),
            properties=pika.BasicProperties(delivery_mode=2)
        )


        logger.info("✅ Published vote update to poll_service")
        
        channel.close()
        connection.close()

    except Exception as e:
        logger.error(f"❌ Failed to publish vote update: {e} ")
