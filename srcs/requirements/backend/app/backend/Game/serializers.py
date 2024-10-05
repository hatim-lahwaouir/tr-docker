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

# class RoundPlayerSerializer(serializers.ModelSerializer):
#     user = UserSerializer()
#     class Meta:
#         model = RoundPlayer
#         fields = ['user']

class RoundSerializer(serializers.ModelSerializer):
    players = serializers.SerializerMethodField()
    # matches = MatchSerializer(many=True)
    
    class Meta:
        model = Round
        fields = ['players']

    def get_players(self, obj):
        if obj.type == 1:
            players = obj.players.all().order_by('PositionR1')
            # print(f"PALYERS+++++++++++++>{players}")
        if obj.type == 2:
            players = obj.players.all().order_by('PositionR2')
        else:
            players = obj.players.all()
        return UserSerializer(players, many=True).data


# class tournamentSerializer(serializers.ModelSerializer):
#     participant = serializers.SerializerMethodField()

#     class Meta:
#         model = Tournament
#         fields = ['participant']

#     def __init__(self, *args, **kwargs):
#         self.trRound = kwargs.pop('trRound', None)#ila makansh trType at7t None
#         super().__init__(*args, **kwargs)

#     def get_participant(self, obj):
#         participants = obj.participant.all()
#         if self.trRound is not None:
#             participants = participants.filter(trRound=self.trRound)
#             participants = participants.order_by('trPosition')
#         else:
#             print('trRound is empty################################')
#         return UserSerializer(participants, many=True).data
