from django.db import models
from Models.models import User




class SGame(models.Model):
    p1 = models.ForeignKey(User, related_name="sg_as_player1", on_delete=models.CASCADE)
    p2 = models.ForeignKey(User, related_name="sg_as_player2", on_delete=models.CASCADE)
    winner = models.ForeignKey(User, null=True,related_name="match_wons", on_delete=models.CASCADE)
    scorePlayer1 = models.IntegerField(default=0)
    scorePlayer2 = models.IntegerField(default=0)
    game_at = models.DateTimeField(auto_now=True)
    p1_attend = models.BooleanField(default=False) 
    p2_attend = models.BooleanField(default=False) 
    finished = models.BooleanField(default=False) 





class Round(models.Model):
    game = models.ForeignKey(SGame, on_delete=models.CASCADE, related_name='rounds')
    winner = models.ForeignKey(User, on_delete=models.CASCADE, null=True, default=None, related_name='my_win_rounds')
    p1choice = models.CharField(max_length=1, default='')
    p2choice = models.CharField(max_length=1, default='')



