from django.urls import re_path

from . import gameConsumer, trConsumer

websocket_urlpatterns = [
    re_path(r'ws/game/(?P<room_name>\w+)/$',gameConsumer.consumer.as_asgi()),
    re_path(r'ws/tr/(?P<room_name>\w+)/$',trConsumer.consumer.as_asgi()),
]
