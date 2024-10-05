from django.db import models

from django.contrib.auth.base_user import BaseUserManager
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.utils import timezone
import pyotp
from django.core.validators import FileExtensionValidator
import os


def upload_to(instance, filename):
    try:
        print('{user_id}.jpg'.format(user_id=instance.id))
        os.remove('media/{user_id}.jpg'.format(user_id=instance.id))    
    except:
        pass
    return '{user_id}.jpg'.format(user_id=instance.id)

class UserManager(BaseUserManager):
    def create_user(self, email, password, **extra_fields):
        if not email:
            raise ValueError(("The Email must be set"))
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save()
        return user

    def create_superuser(self, email, password, **extra_fields):
            """
            Create and save a SuperUser with the given email and password.
            """
            extra_fields.setdefault("is_staff", True)
            extra_fields.setdefault("is_superuser", True)
            extra_fields.setdefault("is_active", True)

            if extra_fields.get("is_staff") is not True:
                raise ValueError(_("Superuser must have is_staff=True."))
            if extra_fields.get("is_superuser") is not True:
                raise ValueError(_("Superuser must have is_superuser=True."))
            return self.create_user(email, password, **extra_fields)
 
# Create your models here.

class User(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=50)
    username = models.CharField(max_length=30)
    date_joined = models.DateTimeField(default=timezone.now)
    level  = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    fract_level = models.DecimalField(max_digits=1000,decimal_places=2, default=0.00)
    games = models.IntegerField(default=0)
    wins = models.IntegerField(default=0)
    ready = models.BooleanField(default=False)
    online = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    sentInvite= models.BooleanField(default=False)
    profile_img = models.ImageField(upload_to=upload_to, default='default.jpg',validators=[FileExtensionValidator(allowed_extensions=['jpg'] )])
    dark_mode = models.BooleanField(default=True)
    valid_email = models.BooleanField(default=False)
    trAlias = models.CharField(max_length=30, default="x")
    trRound = models.IntegerField(default=1)
    PositionR1 = models.IntegerField(default=1)
    PositionR2 = models.IntegerField(default=1)
    isInTournament = models.BooleanField(default=False)
    isInGame = models.BooleanField(default=False)
    ballc = models.CharField(max_length=7, default="FFFFFF")
    paddlec = models.CharField(max_length=7, default="FFFFFF")
    tablec = models.CharField(max_length=7, default="000000")
    # we still add  game customisation of each user


    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    objects = UserManager()

    def __str__(self):
        return self.email

class Game(models.Model):
    winner = models.ForeignKey(User, related_name='my_won_games', on_delete=models.SET_NULL, null=True)
    loser = models.ForeignKey(User, related_name='my_lost_games', on_delete=models.SET_NULL, null=True)
    date_of_game = models.DateTimeField(default=timezone.now)
    winner_score = models.PositiveIntegerField()
    loser_score = models.PositiveIntegerField()


class Notification(models.Model):
    receiver = models.ForeignKey(User, related_name='my_notifications', on_delete=models.SET_NULL, null=True)
    sender = models.ForeignKey(User, related_name='sent_notifications', on_delete=models.SET_NULL, null=True)
    date_of_notification = models.DateTimeField(default=timezone.now)
    content = models.TextField(default='')
    seen = models.BooleanField(default=False)



class Messages(models.Model):
    sender = models.ForeignKey(User, on_delete=models.SET_NULL, null=True ,related_name='sent_messages')
    receiver = models.ForeignKey(User, on_delete=models.SET_NULL, null=True , related_name='received_messages')
    seen = models.BooleanField(default=False)
    content = models.TextField()
    date_of_message = models.DateTimeField(auto_now_add=True)


class ForgetPassword(models.Model):
    code = models.CharField(max_length=32, default='')
    url = models.CharField(max_length=100, default='')
    code_expired_at = models.DateTimeField(default=timezone.now)
    url_expired_at = models.DateTimeField(default=timezone.now)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='forgetPassword')

    
class Two_FA(models.Model):
    TWO_FA_CHOICES = (
        ('SE', 'send_email'),
        ('AA', ' authenticator_app'),
        ('NONE', 'None'),
    )
    choice = models.CharField(max_length=4, choices=TWO_FA_CHOICES, default='SE')
    key = models.CharField(max_length=32, blank=True, default='pyotp.random_base32')
    date_created = models.DateTimeField(default=timezone.now)
    expired_at = models.DateTimeField(default=timezone.now)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='my_2FA')






class FriendshipStatus(models.Model):
    STATUS = (
        ('FR', 'friends'),
        ('PE', 'pending'),
        ('BL', 'blocked'),
    )
    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['receiver', 'sender'], name='unique_friendshipStatus')
        ]
        # Ensure there's no reverse duplicate friendship (A-B and B-A)
        unique_together = ('receiver', 'sender')
    status = models.CharField(max_length=2, default='PE')
    sender = models.ForeignKey(User, on_delete=models.CASCADE,default=None, null=True, related_name='sent_RS')
    receiver = models.ForeignKey(User, on_delete=models.CASCADE,default=None, null=True, related_name='received_RS')

