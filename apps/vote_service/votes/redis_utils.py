import redis
import os
import logging
import json

logger = logging.getLogger(__name__)

r = redis.from_url(os.getenv("REDIS_URL"))
script_path = os.path.join(os.path.dirname(__file__), "vote.lua")

with open(script_path) as f:
    vote_script = r.register_script(f.read())

def cast_vote(poll_id, option_id, voter_name):
    res = vote_script(
        keys=[f"poll:{poll_id}:voters", f"poll:{poll_id}:tally"],
        args=[voter_name, str(option_id)]
    )
    logger.info(res) 
    return res


def publish_vote_to_ws_service(poll_id, poll_text, option_id, option_text):
    message = {
        "poll_id": poll_id,
        "poll_text": poll_text,
        "option_id": option_id,
        "option_text": option_text
    }
    r.publish("global:votes", json.dumps(message))