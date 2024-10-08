from django.contrib.auth import get_user_model
from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta


#     winner = models.ForeignKey(User, related_name='my_won_games', on_delete=models.SET_NULL, null=True)
    # loser = models.ForeignKey(User, related_name='my_lost_games', on_delete=models.SET_NULL, null=True)

User = get_user_model()

def default_time():
    return timezone.now() + timedelta(seconds=10)


CHOICES = (
        ('P', 'accept'),
        ('A', 'accept'),
        ('D', 'decline'),
    )

class InviteQueue(models.Model):
    sender   = models.ForeignKey(User,on_delete=models.CASCADE, related_name='sent_invite')
    receiver = models.ForeignKey(User,on_delete=models.CASCADE, related_name='received_invite')
    time = models.DateTimeField(default=default_time)
    status = models.CharField(max_length=1, default='P', choices=CHOICES)
