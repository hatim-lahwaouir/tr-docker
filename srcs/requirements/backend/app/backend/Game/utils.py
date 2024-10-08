from .models import Match
from Models.models import User
from asgiref.sync import sync_to_async
from channels.db import database_sync_to_async

@database_sync_to_async
def get_match(match_id):
    return Match.objects.get(pk=match_id)

@database_sync_to_async
def save_match(match):
    match.save()
