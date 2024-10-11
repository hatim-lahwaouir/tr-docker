import json
from re import match
from channels.generic.websocket import AsyncWebsocketConsumer
from Models.models import User
from asgiref.sync import async_to_sync , sync_to_async
from Game.models import Match, Round, Tournament
from .utils import get_match
from channels.db import database_sync_to_async
import asyncio
import math
import random

from Game.serializers import UserSerializer

import time
from decimal import Decimal

gameD = {}

@database_sync_to_async
def setInGame(user, state):
    user.isInGame = state
    user.save()

class consumer(AsyncWebsocketConsumer):
    @database_sync_to_async
    def checkUser(self, m):
        if self.user != m.opponent and self.user != m.player:
            return False
        return True
    async def connect(self):
        self.user = self.scope['user']
        if not self.user.is_authenticated:
            return
        await setInGame(self.user, True)
        self.room_name = self.scope["url_route"]["kwargs"]["room_name"]
        m = await get_match(int(self.room_name))
        if m == None:
            return
        if await self.checkUser(m) == False:
            return
        self.room_group_name = f"game_{self.room_name}"
        self.gc = None
        self.ballTask = None
        self.opTask = None
        self.plTask = None
        await self.channel_layer.group_add(
            self.room_group_name, self.channel_name
        )
        await self.accept()
    
    @database_sync_to_async
    def CHECK(self):
        if self.user == self.gc.player:
            async_to_sync(self.dbChange)(3)
            async_to_sync(self.winner)()
        elif self.user == self.gc.opponent:
            async_to_sync(self.dbChange)(2)
            async_to_sync(self.winner)()

    async def disconnect(self, close_code):
        if close_code == 3001:
            # await setInGame(self.user,False)
            await self.channel_layer.group_discard(
                self.room_group_name, self.channel_name
            )
            await self.close()
            return
        if self.ballTask:
            self.ballTask.cancel()
        if self.gc:
            if self.gc.finished == False:
                await self.channel_layer.group_send(
                    self.room_group_name, {
                                        "type": "send_data",
                                        "status":"userDisconnected",
                                        }
                )
                return

        elif self.gc == None :
            await self.channel_layer.group_send(
                    self.room_group_name, {
                                        "type": "send_data",
                                        "status":"userDisconnected",
                                        }
                )
            return
        # await self.channel_layer.group_discard(
        #     self.room_group_name, self.channel_name
        # )
        # self.close()
    
    @database_sync_to_async
    def dbChange(self, type):
        if type == 1:
            self.gc.player.isInGame = True
            self.gc.opponent.isInGame = True
            self.gc.player.save()
            self.gc.opponent.save()
        elif type == 2:
            self.gc.winner = self.gc.player
        elif type == 3:
            self.gc.winner = self.gc.opponent
        if type == 3 or type == 2:
            if self.opTask:
                self.opTask.cancel()
            if self.plTask:
                self.plTask.cancel()
        self.gc.save()
    
    @database_sync_to_async
    def smallCheck(self):
        return True if self.gc.winner else False
    
    async def checkScore(self, gId):
        if gameD[gId]['scorePlayer'] == 5:
            await self.dbChange(2)
        
        elif gameD[gId]['scoreOpponent'] == 5:
            await self.dbChange(3)
        
        if await self.smallCheck():
            winnerS = await sync_to_async(UserSerializer)(self.gc.winner)
            await self.channel_layer.group_send(
                        self.room_group_name, {
                                            "type": "send_data",
                                            "status":"gameFinished",
                                            "winner": winnerS.data
                                            }
                    )
            self.gc.scorePlayer = gameD[gId]['scorePlayer']
            self.gc.scoreOpponent = gameD[gId]['scoreOpponent']
            await self.winner()

    async def keepBalling(self, gId, h, w):
        try:
            while not self.gc.finished:
                await self.gameLogic(gId, h, w)
                await self.channel_layer.group_send(
                    self.room_group_name, {
                                        "type": "send_data",
                                        "action":"ball",
                                        "ball_x" : gameD[gId]['ball_x'],
                                        "ball_y" : gameD[gId]['ball_y'],
                                        "scorePlayer": gameD[gId]['scorePlayer'],
                                        "scoreOpponent": gameD[gId]['scoreOpponent']
                                        }
                )
                await self.checkScore(gId)
                await asyncio.sleep(1/60)
        except Exception as e:
            pass

    async def keepPlayerPaddling(self, gId, h, m):
        try:
            while True:
                    await self.paddlePMovement(gId, h, m)
                    await self.channel_layer.group_send(
                        self.room_group_name, {
                                            "type": "send_data",
                                            "action":'play',
                                            "player_y": gameD[gId]['player_y'],
                                            "opponent_y": gameD[gId]['opponent_y'],
                                            "scorePlayer": gameD[gId]['scorePlayer'],
                                            "scoreOpponent": gameD[gId]['scoreOpponent']
                                            } 
                    )
                    await asyncio.sleep(1/60)
        except Exception as e:
            pass
    async def keepOpponentPaddling(self, gId, h, m):
        try:
            while True:
                await self.paddleOMovement(gId, h, m)
                await self.channel_layer.group_send(
                    self.room_group_name, {
                                        "type": "send_data",
                                        "action": 'play',
                                        "player_y": gameD[gId]['player_y'],
                                        "opponent_y": gameD[gId]['opponent_y'],
                                        "scorePlayer": gameD[gId]['scorePlayer'],
                                        "scoreOpponent": gameD[gId]['scoreOpponent']
                                        } 
                )
                await asyncio.sleep(1/60)
        except Exception as e:
            pass
    @database_sync_to_async
    def setWinner(self, id):
        player = User.objects.get(pk=id)
        self.gc.winner = player
    
    # @database_sync_to_async
    # def setReady(self, state):
    #     self.user.ready = state
    #     self.user.save()
    
    async def receive(self, text_data):
        data = json.loads(text_data)

        if data['action'] == 'setWinner':
            self.gc = await get_match(int(data['id']))
            await self.setWinner(int(data['winner']))
            if await self.smallCheck():
                winnerS = await sync_to_async(UserSerializer)(self.gc.winner)
                await self.channel_layer.group_send(
                    self.room_group_name, {
                                        "type": "send_data",
                                        "status":"disconneted",
                                        "winner": winnerS.data
                                        }
                )
                await self.winner()
            return
        if data['action'] == 'playerReady':
            # await self.setReady(True)
            receiver = await sync_to_async(User.objects.get)(id=data["receiver"])
            senderdata = UserSerializer(self.user)
            receiverdata = UserSerializer(receiver)
            await self.channel_layer.group_send(
                self.room_group_name, {
                                    "type": "send_data",
                                    "sender": senderdata.data,
                                    "reciever": receiverdata.data,
                                    "gameId": data["gameId"],
                                    "status": "playerReady",
                                    }
                )
            return

        if data['action'] == 'disconnect':
            await self.disconnect(3001)
            return

        if self.gc == None:
            self.gc = await get_match(int(data['gameId']))
            if int(data['gameId']) not in gameD:
                gameD[int(data['gameId'])] = {
                    'player_x': 5, 'player_y': 175, 'opponent_x': 780,
                    'opponent_y': 175, 'ball_x': 400, 'ball_y': 250,
                    'ball_speed_x':-3, 'ball_speed_y':3, 'scored':True,
                    'scorePlayer':0, 'scoreOpponent':0 , 'ball_speed':3
                }
            await self.dbChange(1)
        if self.gc.finished ==True:
            return
        if self.opTask:
            self.opTask.cancel()
        
        if self.plTask:
            self.plTask.cancel()

        gId = int(data['gameId'])
        await self.checkScore(gId)
        w = int(data['wWidth'])
        h = int(data['wHeight'])
        m = data['movement']
        if data['action'] == 'play':
            if data['movement'] == 'upP' or data['movement'] == 'downP':
                self.plTask = asyncio.create_task(self.keepPlayerPaddling(gId, h, m))
            elif data['movement'] == 'upO' or data['movement'] == 'downO':
                self.opTask = asyncio.create_task(self.keepOpponentPaddling(gId, h, m))
        if self.ballTask == None:
            self.ballTask = asyncio.create_task(self.keepBalling(gId, h, w))

    @database_sync_to_async
    def paddleOMovement(self, gId, h, m):
        movement = m
        moveO = 0
        if movement == 'upO':
            moveO = -15
        elif movement == 'downO' :
            moveO = 15
        elif movement == 'stopO':
            moveO = 0
        #paddles protections
        gameD[gId]['opponent_y'] += moveO
        if gameD[gId]['opponent_y'] <= 0:
            gameD[gId]['opponent_y'] = 0
        elif gameD[gId]['opponent_y'] + 150 >= h:
            gameD[gId]['opponent_y'] = h - 150

    @database_sync_to_async
    def paddlePMovement(self, gId, h, m):
        movement = m
        moveP = 0
        if movement == 'upP':
            moveP = -15
        elif movement == 'downP' :
            moveP = 15
        elif movement == 'stopP':
            moveP = 0

        gameD[gId]['player_y'] += moveP
        
        #paddles protections
        if gameD[gId]['player_y'] <= 0:
            gameD[gId]['player_y'] = 0
        elif gameD[gId]['player_y'] + 150 >= h:
            gameD[gId]['player_y'] = h - 150

    async def send_data(self, event):
        event.pop('type')
        try:
            await self.send(json.dumps(event))
        except Exception as e:
            pass
    @database_sync_to_async
    def winner(self):
        if self.gc.finished == True:
            return
        player = self.gc.winner
        player.wins += 1
        player.level += Decimal('0.56')
        player.fract_level = (player.level % 1) * 100
        if self.gc.typeOfMatch == 'tr':
            player.trRound += 1
            tr = self.gc.tournament
            roundInstance  = Round.objects.filter(type=player.trRound, tournament=tr).first()
            if not roundInstance:
                roundInstance = Round.objects.create(type=player.trRound, tournament=tr)
            roundInstance.players.add(player)
            if (player.PositionR1 == 1 or player.PositionR1 == 2) and player.trRound < 3:
                player.PositionR2 = 1
                try:
                    o = tr.participant.get(trRound=2,PositionR2=2)
                    m = Match.objects.create(player=player, opponent=o, typeOfMatch='tr')
                    m.tournament = self.gc.tournament
                    m.save()
                    player.games += 1
                    player.save()
                    o.games += 1
                    o.save()
                    roundInstance.matches.add(m)
                except Exception as e:
                    pass
            elif (player.PositionR1 == 3 or player.PositionR1 == 4) and player.trRound < 3:
                player.PositionR2 = 2
                try:
                    o = tr.participant.get(trRound=2,PositionR2=1)
                    m = Match.objects.create(player=player, opponent=o, typeOfMatch='tr')
                    m.tournament = self.gc.tournament
                    m.save()
                    player.games += 1
                    player.save()
                    o.games += 1
                    o.save()
                    roundInstance.matches.add(m)
                except Exception as e:
                    pass
        player.save()
        self.gc.player.isInGame = False
        self.gc.opponent.isInGame = False
        # self.gc.player.r = False
        # self.gc.opponent.ready = False
        self.gc.finished = True
        self.gc.player.save()
        self.gc.opponent.save()
        self.gc.save()

    
    @database_sync_to_async
    def gameLogic(self, gId,h, w):

        #ballRestart
        if gameD[gId]['scored']:
            gameD[gId]['ball_x'] = w / 2
            gameD[gId]['ball_y'] = h / 2
            gameD[gId]['ball_speed_x'] = 3 * random.choice([-1, 1])
            gameD[gId]['ball_speed_y'] = random.uniform(-2, 2)
            gameD[gId]['ball_speed'] = 3
            gameD[gId]['scored'] = 0

        #-------------ballAnimation-------------
        gameD[gId]['ball_x'] += gameD[gId]['ball_speed_x']
        gameD[gId]['ball_y'] += gameD[gId]['ball_speed_y']

        #topBottomCheck
        if gameD[gId]['ball_y'] <= 15:
            gameD[gId]['ball_y'] = 15
            gameD[gId]['ball_speed_y'] *= -1
        elif gameD[gId]['ball_y'] + 15 >= h:
            gameD[gId]['ball_y'] = h - 15
            gameD[gId]['ball_speed_y'] *= -1

        #scoreCheck
        if gameD[gId]['ball_x']< -5:
            gameD[gId]['scored'] = True
            gameD[gId]['scoreOpponent'] += 1
        
        if gameD[gId]['ball_x'] + 15 >= w:
            gameD[gId]['scored'] = True
            gameD[gId]['scorePlayer'] += 1

        b_top = gameD[gId]['ball_y'] - 15
        b_bottom = gameD[gId]['ball_y'] + 15
        b_left = gameD[gId]['ball_x'] - 15
        b_right = gameD[gId]['ball_x'] + 15

        o_top = gameD[gId]['opponent_y']
        o_bottom = gameD[gId]['opponent_y'] + 150
        o_left = gameD[gId]['opponent_x']
        o_right = gameD[gId]['opponent_x'] + 15 

        p_top = gameD[gId]['player_y'] 
        p_bottom = gameD[gId]['player_y'] + 150
        p_left = gameD[gId]['player_x'] 
        p_right = gameD[gId]['player_x'] + 15
        
        #check collision  
        if (b_right >= p_left and b_bottom >= p_top and\
            b_left <= p_right and b_top <= p_bottom) or\
            (b_right >= o_left and b_bottom >= o_top and\
            b_left <= o_right and b_top <= o_bottom):
            #right
            if gameD[gId]['ball_x'] > w / 2:
                if b_right >= o_left and gameD[gId]['ball_speed_x'] > 0:
                    collidePoint = gameD[gId]['ball_y'] - (gameD[gId]['opponent_y'] + 150 / 2)
                    collidePoint = collidePoint / (150 / 2)
                    angleRad = collidePoint * (math.pi / 4)
                    gameD[gId]['ball_speed_x'] = gameD[gId]['ball_speed'] * math.cos(angleRad) * -1
                    gameD[gId]['ball_speed_y'] = gameD[gId]['ball_speed'] * math.sin(angleRad)
                    if (gameD[gId]['ball_speed'] < 15):
                        gameD[gId]['ball_speed'] += 0.3
                elif b_bottom > o_top and gameD[gId]['ball_speed_y'] > 0:
                    gameD[gId]['ball_speed_y'] *= -1
                elif b_top < o_bottom and gameD[gId]['ball_speed_y'] < 0:
                    gameD[gId]['ball_speed_y'] *= -1
            #left
            else:
                if b_left <= p_right and gameD[gId]['ball_speed_x'] < 0:
                    collidePoint = gameD[gId]['ball_y'] - (gameD[gId]['player_y'] + 150 / 2)
                    collidePoint = collidePoint / (150 / 2)
                    angleRad = collidePoint * (math.pi / 4)
                    gameD[gId]['ball_speed_x'] = gameD[gId]['ball_speed'] * math.cos(angleRad)
                    gameD[gId]['ball_speed_y'] = gameD[gId]['ball_speed'] * math.sin(angleRad)
                    if (gameD[gId]['ball_speed'] < 15):
                        gameD[gId]['ball_speed'] += 0.3
                elif b_bottom > p_top and gameD[gId]['ball_speed_y'] > 0:
                    gameD[gId]['ball_speed_y'] *= -1
                elif b_top < p_bottom < 30 and gameD[gId]['ball_speed_y'] < 0:
                    gameD[gId]['ball_speed_y'] *= -1
