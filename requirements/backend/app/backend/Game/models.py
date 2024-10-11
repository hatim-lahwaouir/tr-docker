from django.db import models
from Models.models import User

# Create your models here.

# class gameCoordinates(models.Model):
#     player_x = models.IntegerField(default=0)
#     player_y = models.IntegerField(default=175)
#     opponent_x = models.IntegerField(default=785)
#     opponent_y = models.IntegerField(default=175)
#     ball_x = models.IntegerField(default=400)
#     ball_y = models.IntegerField(default=250)
#     ball_speed_x = models.IntegerField(default=-5)
#     ball_speed_y = models.IntegerField(default=5)
#     scored = models.BooleanField(default=True)

#     class Meta:
#         abstract = True

class Tournament(models.Model):
    participant = models.ManyToManyField(User, related_name='in_tournaments')
    numberParticipants = models.IntegerField(default=4)
    finished = models.BooleanField(default=False)
    complete = models.BooleanField(default=False)
    exiters = models.ManyToManyField(User, related_name='exited_tournaments')


class Match(models.Model):
    player = models.ForeignKey(User, related_name="match_as_player", on_delete=models.CASCADE)
    opponent = models.ForeignKey(User, related_name="match_as_opponent", on_delete=models.CASCADE)
    typeOfMatch = models.CharField(max_length=2,default='rg')
    winner = models.ForeignKey(User, null=True,related_name="match_won", on_delete=models.CASCADE)
    scorePlayer = models.IntegerField(default=0)
    scoreOpponent = models.IntegerField(default=0)
    finished = models.BooleanField(default=False)
    tournament = models.ForeignKey(Tournament, null=True,
                                   on_delete=models.CASCADE)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.player.username} vs {self.opponent.username}"

class Round(models.Model):
    players = models.ManyToManyField(User)
    type  = models.IntegerField(default=1)
    matches = models.ManyToManyField(Match)
    tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE)
    finished = models.BooleanField(default=False)

