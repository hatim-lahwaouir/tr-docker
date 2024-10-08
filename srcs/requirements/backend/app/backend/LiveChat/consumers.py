import json

from asgiref.sync import sync_to_async, async_to_sync
from channels.generic.websocket import WebsocketConsumer,AsyncWebsocketConsumer
from Models.models import User
from Models.models import Messages, FriendshipStatus
from django.db.models import Q,F, Prefetch
from channels.db import database_sync_to_async
# from Game.serializers import UserSerializer
# from Game.models import Match
from .serializers import UserInfo

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope['user']
        if not self.user.is_authenticated:
            return
        
        
        self.room_group_name = str(self.user.id)  + '_user_msg'
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        if self.user.is_authenticated:
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        # Send message to room group
        receiver = await self.get_user(text_data_json.get('receiver'))
        can_talk = await self.can_talks(receiver)
        if receiver is None:
            return
        action_type = text_data_json.get('type')
        if action_type is None:
            return
        
        if action_type == 'seen':
            await self.logic_of_seen(text_data_json, receiver, can_talk)
        elif action_type == 'message':
            await self.logic_of_send_message(text_data_json, receiver, can_talk)


    async def logic_of_seen(self, event, receiver, can_talk):
        await self.mark_seen_messages(receiver)
        msg = await self.get_last_message_id(receiver)

        all_seen = await self.all_seen()

        if not can_talk:
            return
        await self.channel_layer.group_send(
            str(self.user.id) + '_user_msg',
            {
                            "type": "seen.messages",
                            "sender": self.user.id,
                            "receiver": receiver.id,
                            "id_last_msg" : msg.id,
                            "all_seen" : all_seen,
                            }
            )
        await self.channel_layer.group_send(
           str(receiver.id) + '_user_msg',
            {
                            "type": "seen.messages",
                            "sender": self.user.id,
                            "receiver": receiver.id,
                            "id_last_msg" : msg.id,
                            }
            )

    async def logic_of_send_message(self, event, receiver, can_talk):
        message = event.get('message')
        if message is None:
            await self.channel_layer.group_send( str(self.user.id) + '_user_msg',{'type' : 'chat.message','error' : "I didn't receive any message !"})
            return 
 
        new = await self.new_conversation(receiver)
        

        if not can_talk:
            await self.channel_layer.group_send( 
                str(self.user.id) + '_user_msg',
                {
                    'type' : 'no.talk',
                }
                ) 
            return 
        await self.save_message(receiver, message)
        info = {
                'type': 'chat.message',
                'message': message,
                'sender' : self.user.id, 
                'sender_info' : UserInfo(self.user).data,
                'receiver': receiver.id,
                'receiver_info' : UserInfo(receiver).data,
                'new' : new,
            }
        
        await self.channel_layer.group_send( str(self.user.id) + '_user_msg',info)
        await self.channel_layer.group_send( str(receiver.id) + '_user_msg', info)


    async def chat_message(self, event):
        await self.send(text_data=json.dumps(event))
    async def seen_messages(self, event):
        await self.send(text_data=json.dumps(event))
    async def no_talk(self, event):
        await self.send(text_data=json.dumps(event))

    @database_sync_to_async
    def get_user(self, user_id:int):
        try:
            return User.objects.get(pk=user_id)
        except:
            return None
    @database_sync_to_async
    def get_last_message_id(self, receiver):
        message = Messages.objects.filter(Q(sender=self.user, receiver=receiver)
                                | Q(receiver=self.user, sender=receiver)).order_by('-date_of_message')
        return message.first()


    @database_sync_to_async
    def save_message(self, receiver, message):
        Messages.objects.create(sender=self.user, receiver=receiver,content=message)
    
    @database_sync_to_async
    def mark_seen_messages(self, receiver):
        Messages.objects.filter(Q(receiver=receiver, sender=self.user) |  Q(sender=receiver, receiver=self.user)).update(seen=True)

    @database_sync_to_async
    def can_talks(self, receiver):
        
        return FriendshipStatus.objects.filter(Q(sender=self.user, receiver=receiver) | Q(sender=receiver, receiver=self.user), status='FR').exists()
    
    @database_sync_to_async
    def new_conversation(self, receiver):
        
        return not Messages.objects.filter(Q(sender=self.user, receiver=receiver) | Q(sender=receiver, receiver=self.user)).exists()

    @database_sync_to_async
    def all_seen(self):
        return not Messages.objects.filter(receiver=self.user, seen=False).exists()
