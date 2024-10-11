from django.contrib import admin
from django.urls import path, include
from rest_framework.permissions import IsAuthenticated
from .views import (login,sign_up, login_oauth, search_friends, 
    friends_list, invite_queue, 
    get_2FA, set_email_none_2fa, set_authenticator_app, verify_authenticator_app , 
    user_info, get_conversations, get_messages, my_info, 
    change_my_info,change_password, forget_password, new_password, upload_image,
    logout, get_friends, login_2fa, get_online_friends, reset_password, get_new_password
    )
from rest_framework_simplejwt.views import (
    TokenRefreshView,
)


urlpatterns = [
    path('login/', login ),
    path('login-2fa/', login_2fa),
    path('sign-up/', sign_up ),
    path('oAuth/', login_oauth),
    path('refresh_token/', TokenRefreshView.as_view()),
    path('search-friends/<str:username>', search_friends),
    path('friends-list/<int:id>/', friends_list ),
    path('invite-queue/', invite_queue),
    path('2fa-info/',get_2FA), 
    path('email-none-2fa/',set_email_none_2fa),
    path('auth-app-2fa/',set_authenticator_app),
    path('auth-app-verify/', verify_authenticator_app),
    path('user-info/<int:user_id>', user_info),
    path('messages/<int:user_id>/<int:count>', get_messages),
    path('conversations/',get_conversations),
    path('me/', my_info),
    path('change-my-info/',change_my_info),
    path('change-password/', change_password),
    path('forget-password/', forget_password),
    path('new-password/', new_password),
    path('pic-upload/', upload_image),
    path('logout/', logout),
    path('get-friends/<str:username>', get_friends),
    path('get-online-friends/', get_online_friends),
    path('reset-password/<str:email>', reset_password),
    path('my-new-password/', get_new_password),
]

