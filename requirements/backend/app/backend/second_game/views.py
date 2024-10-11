from django.shortcuts import render
from rest_framework.permissions import IsAuthenticated,AllowAny
from rest_framework.decorators import api_view, permission_classes
from .models import SGame
from django.db.models import Count
from django.db.models import Q
from Models.models import User
from .serializers import SGameSerializer
from rest_framework.response import Response
from rest_framework import status







@api_view(['GET'])
@permission_classes([IsAuthenticated])
def gameInfo(request, id):
    user = User.objects.filter(pk=id).first()

    if user is None:
        return Response({'detail': 'User not found.'}, status=status.HTTP_400_BAD_REQUEST)


    games = SGame.objects.filter(Q(p1=user) | Q(p2=user), finished=True).annotate(n_win=Count('rounds',filter=Q(rounds__winner=user)),
                                        n_lose=Count('rounds',~Q(rounds__winner=user) & Q(rounds__winner__isnull=False)),
                                        ).order_by('game_at').select_related('p1', 'p2')
    
    n_game = SGame.objects.filter(Q(p1=user) | Q(p2=user)).count()
    
    infos = SGameSerializer(games, many=True, context={'user': id})

    n_win = SGame.objects.filter(winner=user).count()
    

    n_lose = SGame.objects.filter(
    (Q(p1=user) & ~Q(winner=user)) |  # The user is p1, but not the winner
    (Q(p2=user) & ~Q(winner=user))    # The user is p2, but not the winner
      ).filter(
    ~Q(winner=None)  # Ensure that winner is not null
    ).count()


    return Response({'infos' : infos.data, 'game_info' : {'game' : n_game, 'win' : n_win , 'lose': n_lose}})




@api_view(['POST'])
@permission_classes([IsAuthenticated])
def set_game_ui(request):
    num = request.data.get('option')
    
    if num not in (1, 2, 3):
        return Response({'detail': 'Bad option'}, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.filter(pk=request.user.id).first()
    if user is None:
        return Response({'detail': 'User not found.'}, status=status.HTTP_400_BAD_REQUEST)
    user.s_game_option = str(num)
    user.save()

    return Response({'detail': 'Option updated'})



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_game_ui(request):

    user = User.objects.filter(pk=request.user.id).first()
    if user is None:
        return Response({'detail': 'User not found.'}, status=status.HTTP_400_BAD_REQUEST)
    

    return Response({'game_option': user.s_game_option})