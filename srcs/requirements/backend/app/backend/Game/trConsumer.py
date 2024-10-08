import json
from channels.generic.websocket import AsyncWebsocketConsumer
from Models.models import User
from asgiref.sync import async_to_sync , sync_to_async
from channels.db import database_sync_to_async
from .models import Match, Tournament, Round
import asyncio

from Game.serializers import UserSerializer, RoundSerializer, MatchSerializer

from django.db.models import Q

class consumer(AsyncWebsocketConsumer):
    @database_sync_to_async
    def getTrType(self):
        Ttype = Tournament.objects.get(pk=int(self.room_name)).numberParticipants
        return Ttype
    
    @database_sync_to_async
    def get_tournament(self):
        return Tournament.objects.get(pk=int(self.room_name))
    @database_sync_to_async
    def checkUser(self, tr):
        return tr.participant.filter(id=self.user.id).exists()
    
    async def connect(self):
        self.user = self.scope['user']
        if not self.user.is_authenticated:
            return
        self.room_name = self.scope["url_route"]["kwargs"]["room_name"]
        tr = await self.get_tournament()
        if tr == None:
            return
        if await self.checkUser(tr) == False:
            return
        self.trType = await self.getTrType()
        self.tr = await self.get_tournament()
        self.room_group_name = f"tr_{self.room_name}"
        await self.channel_layer.group_add(
            self.room_group_name, self.channel_name
        )
        await self.accept()
    
    async def disconnect(self, close_code):
        self.user.isIntournament = False
        await self.channel_layer.group_discard(
            self.room_group_name, self.channel_name
        )
    
    @database_sync_to_async
    def get_matches(self):
        return Match.objects.filter(tournament=self.tr, finished=False)
    
    @database_sync_to_async
    def serialize_participants(self, RoundType):
        try:
            r = Round.objects.get(tournament=self.tr, type=RoundType)
            serializer = RoundSerializer(r)
            return serializer.data
        except Exception as e:
            return None
    
    @database_sync_to_async
    def serializeUser(self, user):
        serializer = UserSerializer(user)
        return serializer.data

    @database_sync_to_async
    def getUser(self,match, user):
        if user == 'player':
            return match.player
        return match.opponent
    
    @database_sync_to_async
    def getMatches(self):
        rounds = Round.objects.filter(tournament=self.tr)
        matches_data = []
        for round in rounds:
            matches = round.matches.filter(finished=False)
            for match in matches:
                player = async_to_sync(self.getUser)(match, 'player')
                player_data = async_to_sync(self.serializeUser)(player)
                
                opponent = async_to_sync(self.getUser)(match, 'opponent')
                opponent_data = async_to_sync(self.serializeUser)(opponent)

                match_data = {
                    "matchId": match.id,
                    "player": player_data,
                    "opponent": opponent_data
                }
                matches_data.append(match_data)
        return matches_data

    async def receive(self, text_data):
        data = json.loads(text_data)
        if data['action'] == 'join':
            participants_data1 = await self.serialize_participants(1)
            participants_data2 = await self.serialize_participants(2)
            participants_data3 = await self.serialize_participants(3)
            if participants_data3:
                await self.setFinished()

            
            await self.channel_layer.group_send(
                self.room_group_name, {
                    "type": "send.data",
                    "trType":self.trType,
                    "round2": participants_data1,
                    "round3": participants_data2,
                    "final": participants_data3,
                    "action": 'show',
                }
            )
            if self.tr.complete and participants_data3 == None:
                matches_data = await self.getMatches()
                await self.channel_layer.group_send(
                    self.room_group_name, {
                        "type": "send.data",
                        "action": "startGame",
                        "matches": matches_data
                    }
                )
            
    # async def my_handler(self, event):
        

    @database_sync_to_async
    def setFinished(self):
        self.tr.finished = True
        participants = self.tr.participant.all()
        for user in participants:
            user.isInTournament = False
            user.save()
        self.tr.save()
        # self.user.save()

    async def send_data(self, event):
        event.pop('type')
        try:
            await self.send(json.dumps(event))
        except Exception as e:
            pass