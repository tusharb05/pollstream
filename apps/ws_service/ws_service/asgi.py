"""
ASGI config for ws_service project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/howto/deployment/asgi/
"""

from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application
import pollsockets.routing
from channels.auth import AuthMiddlewareStack
import threading
from pollsockets.redis_subscriber import run_redis_sub
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ws_service.settings')
django.setup()

threading.Thread(target=run_redis_sub, daemon=True).start()

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(
            pollsockets.routing.websocket_urlpatterns
        )
    ),
})

# import os
# from django.core.asgi import get_asgi_application
# os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ws_service.settings')
# application = get_asgi_application()
