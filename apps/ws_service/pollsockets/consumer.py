from channels.generic.websocket import AsyncWebsocketConsumer
import json
import logging

logger = logging.getLogger(__name__)
class GlobalVoteConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.group_name = "poll_global"
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()
    
    async def disconnect(self, code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)
    
    async def vote_notification(self, event):
        msg = event["message"]
        # logger.info("MESSAGE RECEIVED")
        await self.send(text_data=json.dumps({
            "type": "vote_notification",
            "voter_name":   msg["voter_name"],
            "poll_id":      msg["poll_id"],
            "poll_text":    msg["poll_text"],
            "option_id":    msg["option_id"],
            "option_text":  msg["option_text"],
        }))