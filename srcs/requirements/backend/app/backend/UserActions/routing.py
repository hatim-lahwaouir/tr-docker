from django.urls import re_path,path

from . import consumers

websocket_urlpatterns = [
        path('ws/user/',consumers.UserManagement.as_asgi()),
]
