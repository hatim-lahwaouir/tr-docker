from asgiref.sync import sync_to_async, async_to_sync
from channels.generic.websocket import WebsocketConsumer,AsyncWebsocketConsumer
from Models.models import User
from .models import SGame, Round
from .serializers import UserSearch
import threading
import json
from django.db.models import Q

user_ids = set()

class GameQueue(WebsocketConsumer):
    def connect(self):
        self.user = self.scope['user']
        if not self.user.is_authenticated:
            return
       
       
        self.gp_n = str(self.user.id)+ '_s_game_q'
        async_to_sync(self.channel_layer.group_add)(self.gp_n, self.channel_name)

       
        

        if SGame.objects.filter(Q(p1=self.user) | Q(p2=self.user) , finished=False).exists() or self.user in user_ids:
            self.close()
            return




        if len(user_ids) == 0:
            user_ids.add(self.user)
        else:
            p1 = self.user
            p2 = user_ids.pop()
            while len(user_ids) > 0 and p2.id != p1.id:
                p2 = user_ids.pop()
            gameID = SGame.objects.create(p1=p1, p2=p2)
            self.sendGameId(p1, p2, gameID.id)


        self.accept()



    def disconnect(self):
        if not self.user.is_authenticated:
            return
        async_to_sync(self.channel_layer.group_discard)(
            self.gp_n, self.channel_name
        )

    def disconnect(self, close_code):
        if not self.user.is_authenticated:
            return
        if close_code != 1006:
            try:
                user_ids.remove(self.user)
            except :
                pass
        async_to_sync(self.channel_layer.group_discard)(
            self.gp_n, self.channel_name
        )


    def sendGameId(self, p1, p2, gameId):

        async_to_sync(self.channel_layer.group_send)(
        str(p1.id) + '_s_game_q',
            {
                            "type": "game.id",
                            "gameId" :  gameId,                        
                            "op": UserSearch(p2).data,
                             
                            }
            )
        async_to_sync(self.channel_layer.group_send)(
        str(p2.id) + '_s_game_q',
            {
                            "type": "game.id",
                            "gameId" : gameId,
                            "op": UserSearch(p1).data,
                            }
            )

    def receive(self, text_data):
        text_data_json = json.loads(text_data)
        choice = text_data_json.get('choice')

        if not choice in ('P', 'R', 'S'):
            return

    def game_id(self, event):
        self.send(text_data=json.dumps(event))

        
    

class Game(WebsocketConsumer):
    def connect(self):
        self.user = self.scope['user']
        if not self.user.is_authenticated:
            return
        self.gameId = int(self.scope['url_route']['kwargs']['game_id'])

        self.gp_n =  str(self.user.id) + '_s_game'
  


        game = SGame.objects.filter(id=self.gameId).first()
  
        self.game = game
        if game is None:
            return
  
  
        #  we are ready have two players
        if self.user.id == game.p1.id and game.p1_attend  == True:
            return 
        if self.user.id == game.p2.id and game.p2_attend  == True:
            return 

        self.accept()     



        if self.user.id == game.p1.id:
            game.p1_attend = True
        if self.user.id == game.p2.id:
            game.p2_attend = True
        
        game.save()
        async_to_sync(self.channel_layer.group_add)(self.gp_n, self.channel_name)

        

        async_to_sync(self.channel_layer.group_send)(
        self.gp_n,
            {
                            "type": "welcome.game",
                            "id" : self.gameId,
                            }
            )

        if game.p2_attend == True and game.p1_attend == True:
            p1Info  = UserSearch(game.p1)
            p2Info  = UserSearch(game.p2)

            async_to_sync(self.channel_layer.group_send)(
            str(game.p1.id) + '_s_game',
                {
                                "type": "start.game",
                                "p1_data" : p1Info.data,
                                "p2_data" : p2Info.data,
                                "id" : self.gameId,
                                }
                )
            async_to_sync(self.channel_layer.group_send)(
            str(game.p2.id) + '_s_game',
                {
                                "type": "start.game",
                                "p1_data" : p1Info.data,
                                "p2_data" : p2Info.data,
                                "id" : self.gameId,
                                }
                )
            self.inactive_user()
            return
        self.start_timeout()





    def start_timeout(self, timeout=8):
        """Start a timer to disconnect if second player doesn't join in time."""
        def timeout_action():
            game = SGame.objects.filter(pk = self.gameId).first()
            if  game is None or game.p1_attend and game.p2_attend:
                return
            async_to_sync(self.channel_layer.group_send)(
                str(game.p1.id) + '_s_game',
                {
                    "type": "invalid.game",
                    'p1' : game.p2.id,
                    'p2' : game.p1.id,
                }
            )

            async_to_sync(self.channel_layer.group_send)(
                str(game.p2.id) + '_s_game',
                {
                    "type": "invalid.game",
                    'p1' : game.p2.id,
                    'p2' : game.p1.id,
                }
            )
            game.delete()


        self.timer = threading.Timer(timeout, timeout_action)
        self.timer.start()




    def receive(self, text_data):
        text_data_json = json.loads(text_data)
        choice = text_data_json.get('choice')

        if not choice in ('R', 'P', 'S'):
            return
        if hasattr(self, 'InvactiveUserTimer'):
            self.reset_inactive_user()

        game = SGame.objects.filter(pk=self.gameId).first()

        if game is None:
            self.disconnect(1000)
            return 


        if game.finished:
            self.disconnect(1000)
            return
    
        rounds = game.rounds.count()

        
        
        # getting the current round
        current_round = game.rounds.last() if rounds > 0 else None


        if current_round is None or (current_round.p1choice and current_round.p2choice):
            current_round = Round.objects.create(game=game)





        #  get the choice of each one of them
        if game.p1.id == self.user.id:
            current_round.p1choice = choice
        if game.p2.id == self.user.id:
            current_round.p2choice = choice


        if current_round.p1choice and current_round.p2choice:
            self.handelRoundWinner(current_round, rounds + 1)
            
            rounds = game.rounds.count()

            if rounds == 3:
                self.handelGameWinner()

        current_round.save()





    def handelGameWinner(self,):
        game = SGame.objects.filter(pk=self.gameId).first()
        if game is None:
            return




        p1 = game.p1
        p2 = game.p2


        p1_n_wins = game.rounds.filter(winner=p1).count()
        p2_n_wins = game.rounds.filter(winner=p2).count()

        winner = None
        loser = None

        if p1_n_wins > p2_n_wins:
            winner = p1
            loser = p2
        elif p1_n_wins < p2_n_wins:
            winner = p2
            loser = p1


        game.winner = winner
        game.finished = True
        game.save()



        if p1_n_wins != p2_n_wins:
            async_to_sync(self.channel_layer.group_send)(
                str(winner.id) + '_s_game',
                {
                    "type": "game.result",
                    "status" : "win",
                    "winner" : winner.id,
                    "loser" : loser.id,
                }
            )

            async_to_sync(self.channel_layer.group_send)(
                str(loser.id) + '_s_game',
                {
                    "type": "game.result",
                    "status" : "lose",
                    "winner" : winner.id,
                    "loser" : loser.id,
                }
            )
        else:
            async_to_sync(self.channel_layer.group_send)(
                str(game.p1.id) + '_s_game',
                {
                    "type": "game.result",
                    "status" : "draw",
                    "winner" : game.p1.id,
                    "loser" : game.p2.id,
                }
            )

            async_to_sync(self.channel_layer.group_send)(
                str(game.p2.id) + '_s_game',
                {
                    "type": "game.result",
                    "status" : "draw",
                    "winner" : game.p1.id,
                    "loser" : game.p2.id,
                }
            )


    def handelRoundWinner(self, current_round, n):
        winner = None

        if current_round.p1choice == 'S' and  current_round.p2choice == 'P':
            winner = self.game.p1            
        if current_round.p1choice == 'S' and  current_round.p2choice == 'R':
            winner = self.game.p2
        if current_round.p1choice == 'R' and  current_round.p2choice == 'P':
            winner = self.game.p2
        if current_round.p1choice == 'R' and  current_round.p2choice == 'S':
            winner = self.game.p1
        if current_round.p1choice == 'P' and  current_round.p2choice == 'S':
            winner = self.game.p2
        if current_round.p1choice == 'P' and  current_round.p2choice == 'R':
            winner = self.game.p1

        if winner is not None:
            current_round.winner = winner
            current_round.save()
            loser = self.game.p1 if winner.id != self.game.p1.id else self.game.p2

            if winner.id == self.game.p1.id:
                winner_choice = current_round.p1choice
                loser_choice = current_round.p2choice
            else:
                winner_choice = current_round.p2choice
                loser_choice = current_round.p1choice

        if winner is not None:
            async_to_sync(self.channel_layer.group_send)(
                str(winner.id) + '_s_game',
                {
                    "type": "round.result",
                    "status" : "win",
                    'last' : n == 4,
                    'loser_choice' : loser_choice,
                    'winner_choice' : winner_choice,
                }
            )

            async_to_sync(self.channel_layer.group_send)(
                str(loser.id) + '_s_game',
                {
                    "type": "round.result",
                    "status" : "lose",
                    'last' : n == 4,
                    'loser_choice' : loser_choice,
                    'winner_choice' : winner_choice,
                }
            )
        else:
            game = SGame.objects.get(pk=self.gameId)
            async_to_sync(self.channel_layer.group_send)(
                str(game.p1.id) + '_s_game',
                {
                    "type": "round.result",
                    "status" : "draw",
                    'last' : n == 4,
                    'draw_choice': current_round.p2choice,
                }
            )

            async_to_sync(self.channel_layer.group_send)(
                str(game.p2.id) + '_s_game',
                {
                    "type": "round.result",
                    "status" : "draw",
                    'last' : n == 4,
                    'draw_choice': current_round.p2choice,
                }
            )







    def inactiveUserReply(self):
        game =  SGame.objects.filter(pk=self.gameId).first()


        if game is None or game.finished:
            return
        last_round = game.rounds.last()

        async_to_sync(self.channel_layer.group_send)(
            str(game.p1.id) + '_s_game',
            {
                "type": "invalid.game",
                'p1' : game.p2.id,
                'p2' : game.p1.id,
            }
        )

        async_to_sync(self.channel_layer.group_send)(
            str(game.p2.id) + '_s_game',
            {
                "type": "invalid.game",
                'p1' : game.p2.id,
                'p2' : game.p1.id,
            }
        )
        SGame.objects.filter(pk=self.gameId).delete()





    def reset_inactive_user(self):
        if hasattr(self, 'InvactiveUserTimer'):
            self.InvactiveUserTimer.cancel()
        self.InvactiveUserTimer = threading.Timer(15, self.inactiveUserReply)
        self.InvactiveUserTimer.start()


    def inactive_user(self):
        self.InvactiveUserTimer = threading.Timer(15, self.inactiveUserReply)
        self.InvactiveUserTimer.start()


    def disconnect(self, close_code):
        if hasattr(self, 'timer'):
            self.timer.cancel()
        if hasattr(self, 'InvactiveUserTimer'):
            self.InvactiveUserTimer.cancel()
        
        game = SGame.objects.filter(pk=self.gameId).first()
        if game and game.finished == False:
            async_to_sync(self.channel_layer.group_send)(
                str(game.p1.id) + '_s_game',
                {
                    "type": "invalid.game",
                }
            )

            async_to_sync(self.channel_layer.group_send)(
                str(game.p2.id) + '_s_game',
                {
                    "type": "invalid.game",
                }
            )


        if game is None:
            async_to_sync(self.channel_layer.group_send)(
                str(self.user.id) + '_s_game',
                {
                    "type": "invalid.game",
                }
            )
        async_to_sync(self.channel_layer.group_discard)(
            str(self.user.id) + '_s_game',
            self.channel_name
        )
        SGame.objects.filter(pk=self.gameId, finished=False).delete()


    def welcome_game(self, event):
        self.send(text_data=json.dumps(event))
    def start_game(self, event):
        self.send(text_data=json.dumps(event))
    def timeout_game(self, event):
        self.send(text_data=json.dumps(event))
    def round_result(self, event):
        self.send(text_data=json.dumps(event))

    def game_result(self, event):
        self.send(text_data=json.dumps(event))
    def invalid_game(self, event):
        self.send(text_data=json.dumps(event))