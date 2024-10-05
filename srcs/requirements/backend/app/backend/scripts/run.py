
from django.contrib.auth import get_user_model
from Models.models import Two_FA
from  UserManagement.serializers import UserSerializer, UserOauthSerializer, UserInfo, UserSearch



User = get_user_model()
def create_user():

    try:
        for i in range(1, 11):
            user = User(username=f"user{i}", email=f"user{i}@gmail.com", dark_mode=1, full_name=f"User{i} Name", profile_img=f"default{i}.jpeg" )
            user.set_password('user')
            user.save()
                
            TFA = Two_FA(user=user)
            TFA.choice= 'NONE' 
            TFA.save()
            user.my_2FA = TFA
            user.save()
    except:
        pass

    User.objects.all().update(online=0)

    User.objects.all().update(online=False)


    print("Users created!!")

def run():
    create_user()
