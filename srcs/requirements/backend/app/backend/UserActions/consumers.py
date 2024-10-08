import json

from asgiref.sync import sync_to_async, async_to_sync
from channels.generic.websocket import WebsocketConsumer,AsyncWebsocketConsumer
from Models.models import User
from Models.models import Messages, FriendshipStatus, Notification
from django.db.models import Q, F, Prefetch
from channels.db import database_sync_to_async
from Game.serializers import UserSerializer
from .serializers import UserInfo
from Game.models import Match
from .models import InviteQueue
from django.utils import timezone
from datetime import timedelta
from Game.models import Tournament,Match

online_users = {}

class UserManagement(WebsocketConsumer):
    def connect(self):
        
        self.user = self.scope['user']
        if not self.user.is_authenticated:
            return
        self.gp_n = str(self.user.id)+ '_user'
        async_to_sync(self.channel_layer.group_add)(self.gp_n, self.channel_name)

        self.accept()

        self.make_user_online()

    def disconnect(self, close_code):
        # Leave room group
        if not self.user.is_authenticated:
            return
        async_to_sync(self.channel_layer.group_discard)(
            self.gp_n, self.channel_name
        )

        self.make_user_offline()


    def receive(self, text_data):
        text_data_json = json.loads(text_data)
        action_type = text_data_json.get('type')

        if action_type is None:
            return
        '''
            action types are add,accept, decline, unfriend, block

            add  -> we inform   both the sender and receiver about this action 
            decline -> we send for both the sender and receiver about this action
            block,unfriend -> we inform only for the sender that his action was successful

            type:
            sender:
            receiver:
        '''
        receiver = self.get_user(text_data_json.get('receiver'))
        self.user.refresh_from_db()

        if receiver is None:
            return 


        cant_talk = self.cant_talk(receiver)

        if cant_talk  and action_type != 'unblock':
            async_to_sync(self.channel_layer.group_send)(
                self.gp_n,
                {
                                "type": "no.action",
                }
            )
            return
            

        if action_type == 'add':
            self.logic_of_adding(text_data_json, receiver)
        if action_type == 'cancel':
            self.logic_of_cancling(receiver)
        if action_type == 'accept':
            self.logic_of_accepting_declining(text_data_json, 'accept', receiver)
        if action_type == 'decline':
            self.logic_of_accepting_declining(text_data_json, 'decline', receiver)
        if action_type in ('unfriend', 'block', 'unblock'):
            self.logic_of_relation_status(text_data_json, action_type, receiver)
        if action_type in ('gameInvite', 'declineGameInvite', 'acceptGameInvite'):
            self.logic_of_game(text_data_json, action_type, receiver)


    def game_invite(self, event):
        self.send(text_data=json.dumps(event))

    def logic_of_game(self,text_data_json, action_type, receiver):
        if not self.are_friends(receiver):
            async_to_sync(self.channel_layer.group_send)(
                self.gp_n,
                {
                                "type": "no.action",
                }
            )
            return

        senderdata = UserSerializer(self.user)
        receiverdata = UserSerializer(receiver)

        time_threshold = timezone.now() - timedelta(seconds=10)
        if action_type == 'gameInvite':
            if InviteQueue.objects.filter(Q(sender=self.user) | Q(receiver=self.user), status='P' ,time__gte=time_threshold).exists() or InviteQueue.objects.filter(Q(sender=receiver) | Q(receiver=receiver), status='P',time__gte=time_threshold).exists():
                return
            f = InviteQueue.objects.create(sender=self.user, receiver=receiver,status='P')
            async_to_sync(self.channel_layer.group_send)(
                str(receiver.id)+'_user', {
                                "type": "game.invite",
                                "sender": senderdata.data,
                                "receiver": receiverdata.data,
                                "status":"send"
                                }
            )


        if action_type == 'declineGameInvite':
            inv = InviteQueue.objects.filter(sender=receiver, receiver=self.user ,time__gte=time_threshold, status='P').first()
            if inv is None:
                return
            inv.status = 'D'
            inv.save()
            async_to_sync(self.channel_layer.group_send)(
                str(receiver.id)+'_user' , {
                                    "type": "game.invite",
                                    "sender": senderdata.data,
                                    "receiver": receiverdata.data,
                                    "status": "decline"
                                    }
            )

        
        if action_type == 'acceptGameInvite':
            lastInvit = InviteQueue.objects.filter(sender=receiver,receiver=self.user, status='P' ,time__gte=time_threshold).first()
            if lastInvit and lastInvit.status == 'P':
                lastInvit.status = 'A'
                lastInvit.save()
                gameId = self.creat_game(receiver)
                async_to_sync(self.channel_layer.group_send)(
                    str(receiver.id)+'_user', {
                                        "type": "game.invite",
                                        "sender": receiverdata.data,
                                        "receiver": senderdata.data,
                                        "gameId": gameId,
                                        "status": "accept",
                                        }
                )
                async_to_sync(self.channel_layer.group_send)(
                    str(self.user.id)+'_user', {
                                        "type": "game.invite",
                                        "sender": receiverdata.data,
                                        "receiver": senderdata.data,
                                        "gameId": gameId,
                                        "status": "accept",
                                        }
                )
    


    def logic_of_conversations(self, event, receiver):

        async_to_sync(self.channel_layer.group_send)(
            self.gp_n,
            {
                            "type": "seen_messages",
                            "sender": self.user.username,
                            "receiver": receiver.username,
                            }
            )
        async_to_sync(self.channel_layer.group_send)(
            str(receiver.id) + '_user',
            {
                            "type": "seen_messages",
                            "sender": self.user.username,
                            "receiver": receiver.username,
                            }
            )
    def logic_of_relation_status(self, event, status, receiver):

        obj =  FriendshipStatus.objects.filter(Q(sender=self.user, receiver=receiver) | Q(receiver=self.user, sender=receiver)).first()



        if status == 'block':
            if obj and obj.status == 'BL':
                return
            if obj:
                obj.delete()
            FriendshipStatus.objects.create(sender=self.user, receiver=receiver, status='BL')
            Messages.objects.filter(Q(sender=self.user, receiver=receiver) | Q(sender=receiver, receiver=self.user) ).delete()
        elif status == 'unfriend' and obj:
            obj.delete()
        elif obj and status == 'unblock'  and obj.sender.id == self.user.id:
            obj.delete()
        else:
            return

        if status in ('block', 'unfriend'):
            async_to_sync(self.channel_layer.group_send)(
                        str(self.user.id) + '_user',
                            {
                                    "type": "user.offline",
                                    "user": UserInfo(receiver).data,
                                    "status": "onffline", 
                                    }
                            )
            async_to_sync(self.channel_layer.group_send)(
                        str(receiver.id) + '_user',
                            {
                                    "type": "user.offline",
                                    "user": UserInfo(self.user).data,
                                    "status": "offline", 
                                    }
                            )


        async_to_sync(self.channel_layer.group_send)(
           self.gp_n ,
            {
                            "type": "relation.status",
                            "sender": self.user.id,
                            "receiver": receiver.id,
                            'rel_status': status,
                            }
            )

    def logic_of_adding(self, event, receiver):

        sender = self.user
        if FriendshipStatus.objects.filter( ( Q(sender=sender, receiver=receiver) ) |  ( Q(sender=receiver, receiver=sender) ) ).exists():
            async_to_sync(self.channel_layer.group_send)(
                self.gp_n,
                {
                                "type": "user.info",
                                'msg' : 'You already has relation!',
                                }
                )
            return 
        FriendshipStatus.objects.get_or_create(sender=sender, receiver=receiver, status='PE')
        async_to_sync(self.channel_layer.group_send)(
            self.gp_n,
            {
                            "type": "add.friend",
                            "sender": self.user.id,
                            "receiver": receiver.id,
                            }
            )
        async_to_sync(self.channel_layer.group_send)(
           str(receiver.id) + '_user',
            {
                            "type": "add.friend",
                            "sender": self.user.id,
                            "receiver": receiver.id,
                            }
            )
    def logic_of_cancling(self, receiver):
        FriendshipStatus.objects.filter(sender=self.user, receiver=receiver).delete()
        async_to_sync(self.channel_layer.group_send)(
        self.gp_n,{
                            "type": "cancel.invite",
                            "sender": self.user.id,
                            "receiver": receiver.id,
                            "relation_status": 'Anonymous',
                            }
            )
        async_to_sync(self.channel_layer.group_send)(
        str(receiver.id) + '_user',{
                            "type": "cancel.invite",
                            "sender": self.user.id,
                            "receiver": receiver.id,
                            "relation_status": 'Anonymous',
                            }
            )

    def logic_of_accepting_declining(self, event, status:str, sender):
        receiver = self.user

        if status == 'accept': 
            rel = FriendshipStatus.objects.filter(receiver=receiver, sender=sender)
            
            if not rel.exists():
                return
            rel.update(status= 'FR')
            async_to_sync(self.channel_layer.group_send)(
                    str(sender.id) + '_user',
                        {
                                "type": "user.online",
                                "user": UserInfo(receiver).data,
                                "status": "online", 
                                }
                        )
            async_to_sync(self.channel_layer.group_send)(
                    str(receiver.id) + '_user',
                        {
                                "type": "user.online",
                                "user": UserInfo(sender).data,
                                "status": "online", 
                                }
                        )

   
    
        if status == 'decline':
            FriendshipStatus.objects.filter(receiver=receiver, sender=sender).delete()
        

        #relationship status
        rel_status = '' 
        if status == 'accept':
            rel_status = 'friends'
        else:
            rel_status = 'Anonymous'

       # sending info to the frontend of the relationship status 
        async_to_sync(self.channel_layer.group_send)(
           self.gp_n,{
                            "type": "relation.agreement",
                            "sender": sender.id,
                            "receiver": receiver.id,
                            "relation_status": rel_status,
                            }
            )
        async_to_sync(self.channel_layer.group_send)(
           str(sender.id) + '_user',
            {
                            "type": "relation.agreement",
                            "sender": sender.id,
                            "receiver":receiver.id,
                            "relation_status": rel_status, 
                            }
            )

    def add_friend(self, event):
        self.send(text_data=json.dumps(event))

    def relation_agreement(self,event):
        self.send(text_data=json.dumps(event))
 

    def relation_status(self, event):
        self.send(text_data=json.dumps(event))


    def get_user(self, user_id:int):
        try:
            return User.objects.get(pk=user_id)
        except:
            return None


    def make_user_online(self):
        global online_users

        if self.user.id not in online_users:
            online_users[self.user.id] = 1

            user = User.objects.filter(pk=self.user.id).only('online').first()
            user.online = True
            user.save()

            friends =  User.objects.filter(Q(sent_RS__receiver=user, sent_RS__status='FR') | Q(received_RS__sender=user,received_RS__status='FR')).only('id')
            for fr in friends:
                async_to_sync(self.channel_layer.group_send)(
            str(fr.id) + '_user',
                {
                                "type": "user.online",
                                "user": UserInfo(self.user).data,
                                "status": "online", 
                                }
                )
        else:
            online_users[self.user.id] += 1


    def make_user_offline(self):
        global online_users

        online_users[self.user.id] -= 1
        
        if online_users[self.user.id] == 0:
            online_users.pop(self.user.id) 
            user = User.objects.filter(pk=self.user.id).only('online').first()
            user.online = False
            user.save()

            friends =  User.objects.filter(Q(sent_RS__receiver=user, sent_RS__status='FR') | Q(received_RS__sender=user,received_RS__status='FR')).only('id')
            for fr in friends:

                async_to_sync(self.channel_layer.group_send)(
                str(fr.id) + '_user',
                {
                                "type": "user.offline",
                                "user": UserInfo(self.user).data,
                                "status": "offline", 
                                }
                )

    def creat_game(self, receiver):
        match = Match.objects.create(player = self.user, opponent = receiver)
        if type == 'tr':
            match.tournament = Tournament.objects.get(pk=int(request.data.get('trId')))
        match.save()
        self.user.games += 1
        receiver.games += 1
        self.user.save()
        receiver.save()
        return match.id 


    def cant_talk(self, receiver):
        return FriendshipStatus.objects.filter(Q(sender=self.user, receiver=receiver) | Q(sender=receiver, receiver=self.user), status='BL').exists()
 
    def are_friends(self, receiver):
        return FriendshipStatus.objects.filter(Q(sender=self.user, receiver=receiver) | Q(sender=receiver, receiver=self.user), status='FR').exists()

    def user_online(self, event):
        self.send(text_data=json.dumps(event))
    def user_offline(self, event):
        self.send(text_data=json.dumps(event))
    def user_info(self, event):
        self.send(text_data=json.dumps(event))
    def cancel_invite(self, event):
        self.send(text_data=json.dumps(event))
    def no_action(self, event):
        self.send(text_data=json.dumps(event))
