from django.contrib import admin
from django.urls import path, include
from .views import (
    matchId,
    userListing,
    gameStats,
    isParticipant,
    registerParticipant,
    exit,
    Color,
    History,
    checkIsParticipant,
    playerStatus,
    isInGame
)

urlpatterns = [
    path('history/<int:id>', History.as_view()),
    path('settings/', Color.as_view()),
    path('exit/', exit.as_view()),
    path('tr/', isParticipant.as_view()),
    path('checkTr/<int:Id>', checkIsParticipant.as_view()),
    path('isInGame/<int:id>', isInGame.as_view()),
    path('trRegister/', registerParticipant.as_view()),
    path('playerStatus/<int:id>', playerStatus.as_view()),
    path('stats/<str:playerId>', gameStats.as_view()),
    path('<str:playerEmail>/<str:opponentEmail>/<str:type>/', matchId.as_view()),
    path('<str:listByLevel>/', userListing.as_view()),


]
