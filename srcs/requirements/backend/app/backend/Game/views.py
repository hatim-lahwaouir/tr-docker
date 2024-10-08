from curses import OK
from django.shortcuts import render
from .serializers import MatchSerializer, UserSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework_simplejwt.authentication import JWTStatelessUserAuthentication
from rest_framework.permissions import IsAuthenticated, AllowAny
from Models.models import User
from .models import Match, Tournament, Round
from django.shortcuts import get_object_or_404
from django.db.models import Q

# @permission_classes([IsAuthenticated])
# class matchId(APIView):
#     def post(self, request, playerEmail, opponentEmail, type):
#         try:
#             p = get_object_or_404(User, email=playerEmail)
#             o = get_object_or_404(User, email=opponentEmail)
#             match = Match.objects.create(player = p, opponent = o)
#             if type == 'tr':
#                 match.tournament = Tournament.objects.get(pk=int(request.data.get('trId')))
#             match.save()
#             p.games += 1
#             o.games += 1
#             p.save()
#             o.save()
#             return Response({'id': match.id}, status=status.HTTP_201_CREATED)
#         except Exception:
#             return Response(status=status.HTTP_400_BAD_REQUEST)

@permission_classes([IsAuthenticated])
class userListing(APIView):
    def get(self, request):
        try:
            users = User.objects.all().order_by('-level')
            serializer = UserSerializer(users, many = True)
            return Response({'users': serializer.data}, status=status.HTTP_200_OK)
        except:
            return Response(status=status.HTTP_400_BAD_REQUEST)

@permission_classes([AllowAny])
class gameStats(APIView):
    def get(self, request, playerId):
        try:
            user = get_object_or_404(User, id=playerId)
            gameWon = Match.objects.filter(Q(player = user) | Q(opponent = user), 
                                        winner = user)
            gamePlayed = Match.objects.filter(Q(player = user) | Q(opponent = user))
            return Response(
                {
                    'level': user.level,
                    'fract_level': (user.level % 1) * 100 ,
                    'game':gamePlayed.count(),
                    'win':gameWon.count(),
                },
                status = status.HTTP_200_OK
            )
        except:
            return Response(status=status.HTTP_400_BAD_REQUEST)

#tournament
@permission_classes([IsAuthenticated])
class isParticipant(APIView):
    def get(self, request):
        try:
            user = get_object_or_404(User, id=request.user.id)
            isParticipant = user.isInTournament
            if isParticipant == True:
                trId = Tournament.objects.filter(participant=user, finished=False).exclude(exiters=user).first().id
            return Response({
                            'isParticipant':isParticipant,
                            'tournamentId': trId if isParticipant else None},
                            status = status.HTTP_200_OK
            )
        except:
            return Response(status=status.HTTP_400_BAD_REQUEST)

@permission_classes([IsAuthenticated])
class checkIsParticipant(APIView):
    def get(self, request, Id):
        try:
            user = get_object_or_404(User, id=Id)
            isParticipant = user.isInTournament
            return Response({
                            'isParticipant':isParticipant,},
                            status = status.HTTP_200_OK
            )
        except:
            return Response(status=status.HTTP_400_BAD_REQUEST)


@permission_classes([IsAuthenticated])
class registerParticipant(APIView):
    def post(self, request):
        try:
            data = request.data
            user = get_object_or_404(User, id=request.user.id)
            user.trAlias = data.get('alias')
            user.isInTournament = True
            user.trRound = 1
            user.save()
            tr = Tournament.objects.filter(complete=False, numberParticipants=data.get('type'), finished=False).exclude(exiters=user).first()
            if tr == None:
                tr = Tournament.objects.create(numberParticipants=data.get('type'))
            roundInstance, created = Round.objects.get_or_create(type=1, tournament=tr)
            roundInstance.players.add(user)

            if tr.participant.count() < tr.numberParticipants:
                tr.participant.add(user)
                user.PositionR1 = tr.participant.count()
                user.save()
            if tr.participant.count() == tr.numberParticipants:
                tr.complete = True
            tr.save()
            if tr.participant.count() % 2 == 0:
                player = tr.participant.get(PositionR1=tr.participant.count() - 1)
                match = Match.objects.create(player=player, opponent=user, tournament=tr, typeOfMatch='tr')
                player.games += 1
                player.save()
                user.games += 1
                user.save()
                Round.objects.get(tournament=tr, type=1).matches.add(match)
            return Response(status = status.HTTP_201_CREATED)
        except:
            return Response(status=status.HTTP_400_BAD_REQUEST)

@permission_classes([IsAuthenticated])
class isInGame(APIView):
    def get(self,request, id):
        try:
            user = get_object_or_404(User, id=id)
            return Response({
                            'isInGame':user.isInGame,},
                            status = status.HTTP_200_OK
            )
        except:
            return Response(status=status.HTTP_400_BAD_REQUEST)

@permission_classes([IsAuthenticated])
class exit(APIView):
    def post(self, request):
        try:
            user = get_object_or_404(User, id=request.user.id)
            user.isInTournament = False
            user.save()
            tr = Tournament.objects.get(pk=request.data.get('trID'))
            
            if tr.finished == False:
                tr.exiters.add(user)
                print("*     [trNOTFinished]    *")
            else:
                print("*     [trFinished]   *")
            return Response(status = status.HTTP_200_OK)
        except:
            return Response(status=status.HTTP_400_BAD_REQUEST)

@permission_classes([IsAuthenticated])
class Color(APIView):
    def get(self, request):
        try:
            user = get_object_or_404(User, id=request.user.id)
            return Response(
                {"ballc": user.ballc,"paddlec":user.paddlec,
                "tablec":user.tablec}, status=status.HTTP_200_OK)
        except:
            return Response(status=status.HTTP_400_BAD_REQUEST)
    
    def post(self,request):
        try:
            user = get_object_or_404(User, id=request.user.id)
            data = request.data
            user.ballc = data.get('ballc')
            user.paddlec = data.get('paddlec')
            user.tablec = data.get('tablec')
            user.save()
            return Response(status = status.HTTP_201_CREATED)
        except:
            return Response(status=status.HTTP_400_BAD_REQUEST)

@permission_classes([IsAuthenticated])
class playerStatus(APIView):
    def get(self, request, id):
        try:
            user = get_object_or_404(User, id=id)
            return Response({"status":user.ready}, status=status.HTTP_200_OK)
        except:
            return Response(status=status.HTTP_400_BAD_REQUEST)

@permission_classes([IsAuthenticated])
class History(APIView):
    def get(self, request, id):
        try:
            user = get_object_or_404(User, id=id)
            matches = Match.objects.filter(Q(player=user) | Q(opponent=user)).order_by('-updated_at')
            data = []
            for match in matches:
                opponent = match.opponent if match.player == user else match.player
                gameData = {
                    "opponentId": opponent.id,
                    "opponentPicture" :opponent.profile_img.url,
                    "opponentName" :opponent.username,
                    "score" :f"{match.scorePlayer}:{match.scoreOpponent}",
                    "state" :"WIN" if match.winner == user else "LOSE",
                    "date" : match.updated_at.date(),
                    "time" : match.updated_at.time(),
                }
                data.append(gameData)
            return Response(data, status=status.HTTP_200_OK)
        except:
            return Response(status=status.HTTP_400_BAD_REQUEST)
