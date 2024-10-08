from Models.models import User
from rest_framework import serializers
from .models import SGame


class UserSearch(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [ 'id', 'full_name', 'username', 'profile_img']




class SGameSerializer(serializers.ModelSerializer):
    class Meta:
        model = SGame
        fields = ['n_win', 'n_lose', 'p1', 'p2', 'game_at']
    
    
    
    def to_representation(self, instance):
        
        data = {}
        current_user = self.context['user']

        if current_user == instance.p1.id:
            data['opponentName'] = instance.p2.username
            data['opponentId'] = instance.p2.id
            data['opponentPicture'] = instance.p2.profile_img.url
        else:
            data['opponentName'] = instance.p1.username
            data['opponentId'] = instance.p1.id
            data['opponentPicture'] = instance.p1.profile_img.url

        n_win = instance.n_win
        n_lose = instance.n_lose
        if n_win > n_lose:
            data['state']  = 'WIN'
        elif n_win < n_lose:
            data['state']  = 'LOSE'
        else:
            data['state']  = 'DRAW'

        data['date'] = str(instance.game_at.date())
        data['time'] = str(instance.game_at.time())


        if n_win > n_lose:
            data['score'] = f"{n_win} : {n_lose}"
        else :
            data['score'] = f"{n_lose} : {n_win}"

    
        return data
