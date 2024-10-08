from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.parsers import MultiPartParser,FormParser
from rest_framework_simplejwt.authentication import JWTStatelessUserAuthentication
from rest_framework.permissions import IsAuthenticated,AllowAny
from rest_framework.response import Response
from django.core.exceptions import ObjectDoesNotExist
from rest_framework import status
from rest_framework.decorators import authentication_classes
from rest_framework_simplejwt.tokens import RefreshToken
import pyotp
from  Models.models import FriendshipStatus, Messages, ForgetPassword
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth import get_user_model
from random import randint
from django.utils import timezone
from .serializers import (UserSerializer, MessageSerializer, UserOauthSerializer, UserInfo, UserSearch,
                          LogoutSerializer, UserUpdateInfo, ConversationSerializer, FriendsList)
import requests
from django.db.models import Q, OuterRef, Subquery
import re
from django.core.paginator import Paginator
import imghdr
import random
import string


def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }



def get_user(email, password):
    User = get_user_model()

    user = User.objects.get(email=email)
    if not user.check_password(password):
        raise ObjectDoesNotExist
    return user


def send_2fa_mail(receiver):

    user_key  = receiver.my_2FA.key
    send_mail('2 factor authentication', f'This is your one type possword \'{user_key}\' is valid for {settings.EXPIRED_TIME} min', settings.EMAIL_HOST_USER , [receiver.email])


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):

    # ************************************************
    #        cheking if credentials are correct


    data = request.data
    email = data.get('email', None)
    password = data.get('password', None)


    if not email or not password:
        return (Response({'message' : 'Wrong Password or email'}, status=status.HTTP_401_UNAUTHORIZED))
    try:
        user = get_user(email, password)
    except ObjectDoesNotExist :
        return (Response({'message' : 'Wrong Password or email'}, status=status.HTTP_401_UNAUTHORIZED))
    # ************************************************
    #        checking 2FA 

    user_2fa = user.my_2FA


    if user_2fa.choice == 'NONE':
        tokens = get_tokens_for_user(user)
        user_data = UserInfo(user)
        return Response({'details' : tokens, '2fa': False, 'user_data': user_data.data}, status=status.HTTP_200_OK)


    #  sending email 2fa
    if user_2fa.choice == 'SE':
        user_2fa.date_created = timezone.now()
        user_2fa.key = randint(1_000_000, 9_999_999)
        user_2fa.expired_at = timezone.now() + timezone.timedelta(minutes=settings.EXPIRED_TIME)
        user_2fa.save()
        send_2fa_mail(user)

    return Response({'message' : 'Enter the one time password', '2fa': True}, status=status.HTTP_200_OK)



@api_view(['POST'])
@permission_classes([AllowAny])
def login_2fa(request):
    
    data = request.data
    email = data.get('email', None)
    password = data.get('password', None)
    
    if not email or not password:
        return (Response({'message' : 'Wrong Password or email'}, status=status.HTTP_401_UNAUTHORIZED))
    try:
        user = get_user(email, password)
    except ObjectDoesNotExist :
        return (Response({'message' : 'Wrong Password or email'}, status=status.HTTP_401_UNAUTHORIZED))
    
    data = request.data
    email = data.get('email', None)
    password = data.get('password', None)
    two_FA = data.get('2fa', None)

    user_2fa = user.my_2FA
    
    if user_2fa.choice == 'SE' and two_FA:
        if user_2fa.key == two_FA and user_2fa.expired_at  > timezone.now():
            tokens = get_tokens_for_user(user)
            user.valid_email = True
            user.save()
            user_data = UserInfo(user)
            return Response({'details' : tokens, '2fa': False, 'user_data': user_data.data}, status=status.HTTP_200_OK)
    
    elif user_2fa.choice == 'AA' and two_FA:
        if pyotp.TOTP(user_2fa.key).now() == two_FA:
            tokens = get_tokens_for_user(user)
            user_data = UserInfo(user)
            return Response({'details' : tokens, '2fa': False, 'user_data': user_data.data}, status=status.HTTP_200_OK)
    
    return Response({'message' : 'wrong or expired one time password'}, status=status.HTTP_401_UNAUTHORIZED)




@api_view(['POST'])
@permission_classes([AllowAny])
def sign_up(request):
    User = get_user_model()

    email = request.data.get('email')

    if email is None:
        return Response({'message': 'Invalid request'}, status=status.HTTP_400_BAD_REQUEST)
    
    user = User.objects.filter(email=email).first()

    if user is not None and user.valid_email  == False:
        user.delete()


    serializer  = UserSerializer(data=request.data)

    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    serializer.save()
    return Response({'message' : 'Your account is created !'}, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_oauth(request):
    code = request.data.get('code')
    User = get_user_model()

    if code is None:
        return Response({'message' : 'Problem in code provided'}, status=status.HTTP_400_BAD_REQUEST)
    response = requests.post("https://api.intra.42.fr/oauth/token",
                data={
                        "client_id" : settings.CLIENT_ID_42,
                        "client_secret": settings.SCERET_42,
                        "code" : code,
                        'grant_type':'authorization_code',
                        'redirect_uri': f'https://{settings.HOST}/login/',
                    })


    if response.status_code != 200:
        return Response({'message' : 'wrong code'}, status=status.HTTP_401_UNAUTHORIZED)
    
    result = response.json()
    access_token = result.get('access_token', '')

    getting_data = requests.get('https://api.intra.42.fr/v2/me',
        headers={
            'Authorization' : f'Bearer {access_token}',
        }
    )

    if getting_data.status_code != 200:
        return Response({'message' : 'wrong code'}, status=status.HTTP_401_UNAUTHORIZED)
    
    user_data = getting_data.json()
    user = User.objects.filter(email=user_data.get('email', '')).first()
    if user is not None:
        user_data = UserInfo(user)
        return Response({'details' : get_tokens_for_user(user) , 'user_data': user_data.data}, status=status.HTTP_200_OK)



    serializer = UserOauthSerializer(data=user_data)


    if serializer.is_valid():
        user = serializer.save()
        user_data = UserInfo(user)
        return Response({'details' : get_tokens_for_user(user), 'user_data' : user_data.data}, status=status.HTTP_200_OK)
    
    return Response({'message' : next(serializer[x].errors[0] for x in serializer.errors)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
@authentication_classes([JWTStatelessUserAuthentication])
def search_friends(request, username):
    User = get_user_model()
    users = User.objects.filter(username__startswith=username).exclude(Q(sent_RS__status='BL', sent_RS__receiver=request.user.id)  | Q(id=request.user.id))[:10]
    searched_users = UserSearch(users, many=True)

    return Response({'searched_users' : searched_users.data}, status=status.HTTP_200_OK)



@api_view(['GET'])
@permission_classes([IsAuthenticated])
@authentication_classes([JWTStatelessUserAuthentication])
def friends_list(request, id:int):
    User = get_user_model()



    friends = User.objects.filter(Q(sent_RS__receiver=id,sent_RS__status='FR') |  Q(received_RS__sender=id, received_RS__status='FR'))


    friends_list = FriendsList(friends, many=True)
    
    return Response({'friends_list' : friends_list.data}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
@authentication_classes([JWTStatelessUserAuthentication])
def invite_queue(request):
    User = get_user_model()

    user = User.objects.filter(pk=request.user.id).first()

    if user is None:
        return Response({'message': 'Invalid request '} ,status=status.HTTP_400_BAD_REQUEST)

    queue = user.received_RS.filter(status='PE').values_list('sender', flat=True) 
    users = User.objects.filter(id__in=queue)
    
    invite_queue = UserSearch(users, many=True)
    return Response({'invite_queue' : invite_queue.data})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@authentication_classes([JWTStatelessUserAuthentication])
def change_password(request):
    User = get_user_model()
    user = User.objects.filter(pk=request.user.id).first()
    
    if user is None:
        return Response({'message': 'Invalid request '} ,status=status.HTTP_400_BAD_REQUEST)

    password = request.data.get('password','')
    new_password = request.data.get('new-password')
    
    if not user.check_password(password) or new_password is None:
        return Response({'message': 'Invalid valid password'} ,status=status.HTTP_400_BAD_REQUEST)
    if user.check_password(new_password):
        return Response({'message': 'new password is the same as the old one'} ,status=status.HTTP_400_BAD_REQUEST)

    if len(new_password) < 10 or not bool(re.search(r'(\w)', new_password))  or not bool(re.search(r'(\d)', new_password)):
        return Response({'message': 'Not valid new password'} ,status=status.HTTP_400_BAD_REQUEST)    
    
    user.set_password(new_password)
    user.save()
    return Response({'message' : 'Your password has changed !'}, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
@authentication_classes([JWTStatelessUserAuthentication])
def get_2FA(request):
    User = get_user_model()
    user = User.objects.filter(pk=request.user.id).first()
    
    if user is None:
        return Response({'message': 'Invalid request '} ,status=status.HTTP_400_BAD_REQUEST)

    choice = user.my_2FA.choice 
    result = 'NONE' 
    if choice == 'SE':
        result = 'SE'
    if choice == 'AA':
        result = 'AA'
    return Response({'2fa' : result}, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@authentication_classes([JWTStatelessUserAuthentication])
def set_email_none_2fa(request):
    User = get_user_model()
    user = User.objects.filter(pk=request.user.id).first()
    
    if user is None:
        return Response({'message': 'Invalid request '} ,status=status.HTTP_400_BAD_REQUEST)

    choice = request.data.get('2fa-option') 
    password = request.data.get('password')
    
    if not user.check_password(password):  
        return Response({'message' : 'Invalid Password'}, status=status.HTTP_400_BAD_REQUEST)
    if choice == 'SE' or choice == 'NONE':
        user.my_2FA.choice = choice
        user.my_2FA.save()
    else:
        return Response({'message' : 'Invalid 2fa option!'}, status=status.HTTP_400_BAD_REQUEST)
    
    return Response({'message' : 'Your 2fa has changed !'}, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@authentication_classes([JWTStatelessUserAuthentication])
def set_authenticator_app(request):
    User = get_user_model()
    user = User.objects.filter(pk=request.user.id).first()
    
    if user is None:
        return Response({'message': 'Invalid request '} ,status=status.HTTP_400_BAD_REQUEST)

    password = request.data.get('password')
   
    if not user.check_password(password):  
        return Response({'message' : 'Invalid Password'}, status=status.HTTP_400_BAD_REQUEST)
    
    key = pyotp.random_base32()
    user.my_2FA.key = key
    user.my_2FA.save()
    uri = pyotp.TOTP(key).provisioning_uri(name=user.username, issuer_name='1337')

    return Response({'message' : 'verify this code to change your setting to authenticator app' , 'uri': uri, 'key' : key}, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@authentication_classes([JWTStatelessUserAuthentication])
def verify_authenticator_app(request):
    User = get_user_model()
    user = User.objects.filter(pk=request.user.id).first()
    if user is None:
        return Response({'message': 'Invalid request '} ,status=status.HTTP_400_BAD_REQUEST)
    code = request.data.get('code', '')
    key = user.my_2FA.key
    totp = pyotp.TOTP(key)
    if not totp.verify(code):
        return Response({'message' : 'Invalid code'}, status=status.HTTP_400_BAD_REQUEST)
    
    user.my_2FA.choice='AA'
    user.my_2FA.save()
    return Response({'message' : 'your setting changed successfully' }, status=status.HTTP_200_OK)

 

    

@permission_classes([IsAuthenticated])
@authentication_classes([JWTStatelessUserAuthentication])
@api_view(["GET"])
def user_info(request, user_id):
    User = get_user_model()
    try:
        searched_user =  User.objects.get(pk=user_id) 
        user = User.objects.get(pk=request.user.id)
    except :
        return Response({'message' : 'Invalid id'}, status=status.HTTP_400_BAD_REQUEST)

    userInfo  = UserSearch(searched_user) 
    rel_status = ''  
    rel = None 
    if user.id == searched_user.id:
        rel_status = 'me'
    else:
        rel = FriendshipStatus.objects.filter(Q(sender=user) | Q(sender=searched_user), Q(receiver=searched_user) | Q(receiver=user)).first()
        if rel:
            rel_status = rel.status
        else:
            rel_status = 'strangers'
    by_me = False
    if rel:
        by_me = rel.sender.id == request.user.id
    return Response({'user_data' : userInfo.data, 'status' : rel_status, 'by_me' : by_me},status=status.HTTP_200_OK)



@permission_classes([IsAuthenticated])
@authentication_classes([JWTStatelessUserAuthentication])
@api_view(["GET"])
def get_messages(request, user_id, count):
    User = get_user_model()
    try:
        user = User.objects.get(pk=request.user.id)
        receiver = User.objects.get(pk=user_id)
    except Exception as e:
        return Response({'message' : 'Invalid id'}, status=status.HTTP_400_BAD_REQUEST)
    
    messages  = Messages.objects.filter(Q(receiver=receiver, sender=user) | Q(receiver=user, sender=receiver)).order_by('-date_of_message')
    
    p = Paginator(messages, 20)

    try:
        resp = p.page(count)
    except:
        return Response({'message': 'no more message'}, status=status.HTTP_200_OK)
    s = ConversationSerializer(resp[::-1], many=True)
    return Response({'messages' : s.data}, status=status.HTTP_200_OK)




@permission_classes([IsAuthenticated])
@authentication_classes([JWTStatelessUserAuthentication])
@api_view(["GET"])
def get_conversations(request):
    User = get_user_model()
    user_id = request.user.id

    conversations = Messages.objects.filter(
        id__in=Subquery(
            # geting ids of all users that i had conversation with them 
            User.objects.filter(Q(received_messages__sender=user_id) | Q(sent_messages__receiver=user_id))
            .distinct().annotate(
                # then going on each user and check the last converstaion with him
                last_message=Subquery(
                    Messages.objects.filter(Q(sender=user_id, receiver=OuterRef('id')) | Q(sender=OuterRef('id'), receiver=user_id)).order_by('-date_of_message')[:1].values_list('id', flat=True))
            ).values_list('last_message', flat=True)
        )
        )
    s = MessageSerializer(conversations, many=True)  
    return Response({'conversations' :s.data }, status=status.HTTP_200_OK)





@permission_classes([IsAuthenticated])
@authentication_classes([JWTStatelessUserAuthentication])
@api_view(["GET"])
def my_info(request):
    User = get_user_model()
    user = User.objects.filter(pk=request.user.id).first()
    
    if user is None:
        return Response({'message': 'Invalid request '} ,status=status.HTTP_400_BAD_REQUEST)

    userInfo  = UserInfo(user) 
    return Response({'user_data' : userInfo.data},status=status.HTTP_200_OK)



@permission_classes([IsAuthenticated])
@authentication_classes([JWTStatelessUserAuthentication])
@api_view(["POST"])
def change_my_info(request):
    try:
        if request.user.id != int(request.data.get('id')):
            return Response({'message' : 'Invalid id'}, status=status.HTTP_400_BAD_REQUEST)
    except:
        return Response({'message' : 'Invalid id'}, status=status.HTTP_400_BAD_REQUEST)
    s = UserUpdateInfo(data=request.data, partial=True)

    if not s.is_valid():
        return Response(s.errors, status=status.HTTP_400_BAD_REQUEST)
    s.update(request.user.id)
    return Response({'messages' : 'user data updated'}, status=status.HTTP_200_OK)


@permission_classes([AllowAny])
@api_view(["POST"])
def forget_password(request):
    User = get_user_model()
    email = request.data.get('email', '')
    user = User.objects.filter(email=email)
    if not user.exists():
        return Response({'message' : 'Invalid email'}, status=status.HTTP_400_BAD_REQUEST)
    user = user.first()
    obj, created = forgetPassowrd = ForgetPassword.objects.get_or_create(user=user)

    obj.code = randint(1_000_000, 9_999_999)
    obj.code_expired_at = timezone.now() + timezone.timedelta(minutes=settings.EXPIRED_TIME)
    obj.save()
    send_mail('Code for changing you password' ,f'You code for changing you password is \'{obj.code}\' ,it will be expired within ${settings.EXPIRED_TIME} min',settings.EMAIL_HOST_USER, [email])
    return Response({'message' : f'Verification code sent to your email, it will be expired within ${settings.EXPIRED_TIME} min'}, status=status.HTTP_200_OK)


@permission_classes([AllowAny])
@api_view(["POST"])
def new_password(request):
    code = request.data.get('code')
    email = request.data.get('email')
    new_password = request.data.get('new-password')
    User = get_user_model()
    if code is None or email is None:
        return Response({'message' : 'Invalid data'}, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.filter(email=email)
    if not user.exists():
        return Response({'message' : 'Invalid email'}, status=status.HTTP_400_BAD_REQUEST)
    user = user.first()

    obj = ForgetPassword.objects.get(user=user)

    if code != obj.code or obj.code_expired_at < timezone.now():
        return Response({'message' : 'Invalid code'}, status=status.HTTP_400_BAD_REQUEST)
    
    if len(new_password) < 10:
        return Response({'message': 'Not valid new password'} ,status=status.HTTP_400_BAD_REQUEST)
    
    user.set_password(new_password)
    user.save()

    return Response({'message' : 'You password changes successfully'}, status=status.HTTP_200_OK)



@permission_classes([IsAuthenticated])
@authentication_classes([JWTStatelessUserAuthentication])
@parser_classes((MultiPartParser, FormParser))
@api_view(["POST"])
def upload_image(request):
    User = get_user_model()
    user = User.objects.filter(pk=request.user.id).first()
    
    if user is None:
        return Response({'message': 'Invalid request '} ,status=status.HTTP_400_BAD_REQUEST)


    img = request.data.get('image')
    user.profile_img = img
   
    if (img is None or img.size is None):
        return Response({f'message' : 'invalid img size'}, status=status.HTTP_400_BAD_REQUEST)
    img_mime_type = imghdr.what(img)
    valid_image_formats = ['jpg', 'png']
    print(img_mime_type)

    if img_mime_type not in valid_image_formats:
        return Response({'message': 'Invalid image format. Only JPG are allowed.'}, status=status.HTTP_400_BAD_REQUEST)
 
    user.save()
    if img.size > settings.IMG_MAX_SIZE:
        return Response({f'message' : 'The image size is more then {settings.IMG_MAX_SIZE}MB'}, status=status.HTTP_400_BAD_REQUEST)
    user.save()
    return Response({'messaeg':'The image was uploaded successfully'})




@permission_classes([IsAuthenticated])
@authentication_classes([JWTStatelessUserAuthentication])
@api_view(['POST'])
def logout(request):
    s = LogoutSerializer(data=request.data)
    s.is_valid()
    s.save()
    return Response(status=status.HTTP_204_NO_CONTENT)



@permission_classes([IsAuthenticated])
@authentication_classes([JWTStatelessUserAuthentication])
@api_view(['GET'])
def  get_friends(request, username:str):


    User = get_user_model()
    user = User.objects.filter(pk=request.user.id).first()
    
    if user is None:
        return Response({'message': 'Invalid request '} ,status=status.HTTP_400_BAD_REQUEST)

    friendsList = list(User.objects.filter(sent_RS__receiver=user, sent_RS__status='FR',username__startswith=username)[:5])
    friendsList += list(User.objects.filter(received_RS__sender=user, received_RS__status='FR',username__startswith=username)[:5])

    friends = UserSearch(friendsList, many=True)

    return Response({'friends' : friends.data})




@permission_classes([IsAuthenticated])
@authentication_classes([JWTStatelessUserAuthentication])
@api_view(['GET'])
def get_online_friends(request):
    User = get_user_model()

    oneline_friends = User.objects.filter(Q(sent_RS__receiver=request.user.id, sent_RS__status='FR') | Q(received_RS__sender=request.user.id, received_RS__status='FR'))

    data = FriendsList(oneline_friends, many=True)

    return Response({'online_friends' : data.data})




@permission_classes([AllowAny])
@api_view(['GET'])
def reset_password(request, email):
    User = get_user_model()
    user = User.objects.filter(email=email).first()


    if user is None:
        return Response({'message': 'Invalid email'}, status=status.HTTP_400_BAD_REQUEST)

    obj , _  = ForgetPassword.objects.get_or_create(user=user)
    obj.url = ''.join(random.choices(string.ascii_letters + string.digits, k=100))
    obj.url_expired_at = timezone.now() + timezone.timedelta(minutes=settings.EXPIRED_TIME)
    obj.save()


    url = f"https://{settings.HOST}/resetpassword/{obj.url}"

    send_mail('Rest Password ', f'This the url for reseting your password    {url}    is valid for {settings.EXPIRED_TIME} min', settings.EMAIL_HOST_USER , [email])
    return Response({'message': 'We sent you an email to reset your password !'})




@permission_classes([AllowAny])
@api_view(['POST'])
def get_new_password(request):
    User = get_user_model()
    url = request.data.get('url', '')
    password = request.data.get('password', '')

    obj = ForgetPassword.objects.filter(url=url).first()

    if obj is None or obj.url_expired_at < timezone.now():
        return Response({'message': 'Invalid url'}, status=status.HTTP_400_BAD_REQUEST)
    
    if len(password) < 10:
        return Response({'message': 'Invalid password'} ,status=status.HTTP_400_BAD_REQUEST)

    user = obj.user
    obj.url = ''
    user.set_password(password)

    user.save()
    obj.save()
    return Response({'message': 'our password was reset successfully.'})
