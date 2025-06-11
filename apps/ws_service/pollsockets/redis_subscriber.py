import redis
import os
from channels.layers import get_channel_layer
import asyncio
import json
import logging
from asgiref.sync import async_to_sync

logger = logging.getLogger(__name__)

r = redis.from_url(os.getenv("REDIS_URL"))
channel_layer = get_channel_layer()

def run_redis_sub():
    logger.info("running redis subscriber from ws_service")
    pubsub = r.pubsub()
    pubsub.subscribe("global:votes")

    for message in pubsub.listen():
        if message["type"] == "message":
            data = json.loads(message["data"])
            logger.info("✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨")
            
            async_to_sync(channel_layer.group_send)(
                "poll_global",
                {
                "type": "vote_notification",
                "message": data
                }
            )

async def send_to_ws(data):
    await channel_layer.group_send(
        "poll_global",
        {
            "type": "vote_notification",
            "message": data
        }
    )