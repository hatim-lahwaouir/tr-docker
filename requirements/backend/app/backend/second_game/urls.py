from django.contrib import admin
from django.urls import path, include
from rest_framework.permissions import IsAuthenticated
from .views import gameInfo, set_game_ui,get_game_ui


urlpatterns = [
    path('history/<int:id>', gameInfo ),
    path('get-option/', get_game_ui),
    path('set-option/', set_game_ui),
]

