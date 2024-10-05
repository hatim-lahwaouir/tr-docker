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

# async def gameLogic(data):
#     # movement = data['movement']
#     # print(f"@@{data}@")
#     gc = await get_match(int(data['gameId']))

#     #ballRestart
#     if gc.scored:
#         gc.ball_x = int(data['wWidth']) / 2
#         gc.ball_y = int(data['wHeight']) / 2
#         gc.ball_speed_x = 5
#         gc.ball_speed_y = -5
#         gc.scored = 0

#     #-------------ballAnimation-------------
#     gc.ball_x += gc.ball_speed_x
#     gc.ball_y += gc.ball_speed_y
#     #ballRestartForLaterCheck Reminder !!

#     #topBottomCheck
#     if gc.ball_y < 0:
#         gc.ball_y = 15
#         gc.ball_speed_y *= -1
#     elif gc.ball_y + 15 >= int(data['wHeight']):
#         gc.ball_y = int(data['wHeight']) - 15
#         gc.ball_speed_y *= -1

#     #scoreCheck
#     if gc.ball_x < -5:
#         gc.scored = True
#         gc.scoreOpponent += 1
#     if gc.ball_x + 15 >= int(data['wWidth']):
#         gc.scored = True
#         gc.scorePlayer += 1


#     #checking the player whom the ball's going to
#     #ball collision wiht player check
#     if gc.ball_x > int(data['wWidth']) / 2:
#         if (gc.ball_x + 15 >= gc.opponent_x and\
#             gc.ball_y >= gc.opponent_y and\
#             gc.ball_y <= gc.opponent_y + 150) and gc.ball_speed_x > 0:
#             gc.ball_speed_x *= -1
#     #left
#     else:
#         if  (gc.ball_x - 15 <= gc.player_x and\
#             gc.ball_y >= gc.player_y and\
#             gc.ball_y <= gc.player_y + 150) and gc.ball_speed_x < 0:
#             gc.ball_speed_x *= -1

#     '''
#         balltop = gc.ball_y - 15
#         ballbottom = gc.ball_y + 15
#         ballleft = gc.ball_x - 15
#         ballright = gc.ball_x + 15
#     '''
#     return gc