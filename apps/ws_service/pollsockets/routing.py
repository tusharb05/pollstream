from django.urls import path
from .consumer import GlobalVoteConsumer

websocket_urlpatterns = [
    path("ws/global/", GlobalVoteConsumer.as_asgi()),
]