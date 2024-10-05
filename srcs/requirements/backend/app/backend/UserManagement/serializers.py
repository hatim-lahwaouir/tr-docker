from rest_framework import serializers
from  Models.models import Two_FA, User ,Messages
import re
import requests
import os
from rest_framework_simplejwt.tokens import RefreshToken, TokenError

class UserMessageInfo(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id','username', 'profile_img']




class ConversationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Messages
        fields = '__all__'

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'full_name', 'password', 'email']

    def save(self):
        validated_data = self.validated_data
        user = User(username=validated_data['username'], 
                    full_name=validated_data['full_name'],
                    email=validated_data['email'])
        user.set_password(validated_data['password'])
        user.save()
        two_FA = Two_FA()
        two_FA.user = user
        two_FA.save()

    
    def validate_username(self, value):

        if not value.isalnum():
            raise serializers.ValidationError('Username can contains only digits and alpha')
        if len(value) > 30 or len(value) < 3:
            raise serializers.ValidationError('Invalid username (max length is 30) (min length is 3)')
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError('Username already exists')
        return value
    
    def validate_full_name(self, value):
        pattern = r'^[A-Za-z0-9 ]+$'
    
        if len(value) < 4 or len(value) > 50:
            raise serializers.ValidationError('Invalid full_name (max length is 50) (min length is 4)')


        if not re.match(pattern, value):
            raise serializers.ValidationError('full name can contains only digits,space, and alpha')

        
        return value


    def validate_password(self, value):
        if len(value) < 10 :
            raise serializers.ValidationError('Invalid password')
        return value


    def validate_email(self, value):
        pattern  = r'^[a-zA-Z]+[a-zA-Z0-9_@.]+$'
        user = User.objects.filter(email=value).first()

    
        if user and user.valid_email:
            raise serializers.ValidationError('Email already exists')
        if bool(re.match(pattern, value)):
            return value
        raise serializers.ValidationError('Invalid email')
        



def create_pic(image, user):
    url = image.get('link')
    response = requests.get(url, verify=False)
    if response.status_code == 200:
        _id = user.id
        img_name = f'media/{_id}.jpg'

        with open(img_name, 'wb') as pic:
            pic.write(response.content)        
        user.profile_img = f'{_id}.jpg'
        user.save()


class UserOauthSerializer(serializers.Serializer):
    email = serializers.EmailField()
    usual_full_name = serializers.CharField()
    image = serializers.JSONField()
    login = serializers.CharField()
    
    def save(self):
        self.validated_data['username'] = self.validated_data['login']
        self.validated_data['full_name'] = self.validated_data['usual_full_name']
        self.validated_data['valid_email'] = True
        image = self.validated_data.get('image')
        self.validated_data.pop('image')
        self.validated_data.pop('login')
        self.validated_data.pop('usual_full_name')
        
        user = User(**self.validated_data)
        user.save()
        two_FA = Two_FA()
        two_FA.choice = 'NONE'
        two_FA.user = user
        two_FA.save()
        try:
            create_pic(image, user)
        except:
            pass
        return user 


class UserInfo(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'full_name','email', 'profile_img', 'level', 'dark_mode']

class MessageSerializer(serializers.ModelSerializer):
    sender = UserInfo(read_only=True)
    receiver = UserInfo(read_only=True)

    class Meta:
        model = Messages 
        fields = '__all__' 


class UserUpdateInfo(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'full_name', 'dark_mode']
    
    
    def validate_username(self, value):

        if not value.isalnum():
            raise serializers.ValidationError('Username can contains only digits and alpha')
        if len(value) > 30 or len(value) < 3:
            raise serializers.ValidationError('Invalid username (max length is 30) (min length is 3)')
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError('Username already exists')
        return value
    
    def validate_full_name(self, value):
        pattern = r'^[A-Za-z0-9 ]+$'
    
        if len(value) < 4 or len(value) > 50:
            raise serializers.ValidationError('Invalid full_name (max length is 50) (min length is 4)')


        if not re.match(pattern, value):
            raise serializers.ValidationError('full name can contains only digits,space, and alpha')

        
        return value

    def update(self, user_id):
        User.objects.filter(pk=user_id).update(**self.validated_data)


class UserSearch(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [ 'id','full_name', 'username', 'profile_img', 'level']
    
    def get_users_data(self):
        return (self.data)



class FriendsList(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [ 'id', 'username','full_name', 'profile_img', 'level']
    

    def to_representation(self, instance):
        representation = super().to_representation(instance)

        return representation

class UserProfileImage(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'profile_img']
    



class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField()
    def validate(self, attrs):
        self.token = attrs['refresh']
        return attrs
    def save(self, **kwargs):
        try:
            RefreshToken(self.token).blacklist()
        except TokenError:
            self.fail('bad_token')
