from django.urls import re_path,path

from . import consumers

websocket_urlpatterns = [
        path('ws/sGameQ/',consumers.GameQueue.as_asgi()),
        re_path(r'^ws/sGame/(?P<game_id>\d+)/$', consumers.Game.as_asgi()),
]
