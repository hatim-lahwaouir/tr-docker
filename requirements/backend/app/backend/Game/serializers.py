from pyexpat import model
from rest_framework import serializers
from .models import Match, User, Tournament, Round

class MatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Match
        fields = '__all__'

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['PositionR1', 'PositionR2', 'id', 'email', 'username', 'level', 'fract_level', 'games','wins',
                  'online', 'profile_img',  'dark_mode', 'trAlias', 'isInTournament', 'isInGame']



class RoundSerializer(serializers.ModelSerializer):
    players = serializers.SerializerMethodField()
    # matches = MatchSerializer(many=True)
    
    class Meta:
        model = Round
        fields = ['players']

    def get_players(self, obj):
        if obj.type == 1:
            players = obj.players.all().order_by('PositionR1')
        if obj.type == 2:
            players = obj.players.all().order_by('PositionR2')
        else:
            players = obj.players.all()
        return UserSerializer(players, many=True).data


