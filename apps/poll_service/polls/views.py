from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from rest_framework.throttling import AnonRateThrottle
from rest_framework import status

from .models import Poll, VoteLog
from .serializers import PollListSerializer, PollCreateSerializer, PollDetailSerializer


class PollCreateThrottle(AnonRateThrottle):
    # rate = '1/minute'  # Allow 1 poll creation per minute
    scope = 'poll_create'


# Create your views here.
class PollListView(APIView):
    throttle_classes = [AnonRateThrottle]  # Limit anonymous users, adjust as needed
    def get(self, request):
        polls = Poll.objects.filter(is_active=True).order_by('-created_at')
        full_name = request.GET.get("full_name", "naman")

        paginator = PageNumberPagination()
        paginator.page_size_query_param = 'page_size'  # allows ?page_size=10
        paginator.page_size = 10  # default page size
        paginator.max_page_size = 20
        result_page = paginator.paginate_queryset(polls, request)

        user_logs = VoteLog.objects.filter(voter_name=full_name, poll_id__in=[p.id for p in result_page])
        voted_poll_ids = set(log.poll_id_id for log in user_logs)
        voted_option_ids = set(log.option_id_id for log in user_logs)

        serializer = PollListSerializer(
            result_page,
            many=True,
            context={
                "voted_poll_ids": voted_poll_ids,
                "voted_option_ids": voted_option_ids
            }
        )
        return paginator.get_paginated_response(serializer.data)
    

class PollCreateView(APIView):
    thorttle_classes = [PollCreateThrottle]

    def post(self, request):
        serializer = PollCreateSerializer(data=request.data)
        if serializer.is_valid():
            poll = serializer.save()
            return Response(PollCreateSerializer(poll).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

class PollDetailView(APIView):
    def get(self, request, poll_id):
        full_name = request.GET.get('full_name')

        try:
            poll = Poll.objects.prefetch_related('options').get(pk=poll_id)
        except Poll.DoesNotExist:
            return Response({"detail": "Poll not found"}, status=status.HTTP_404_NOT_FOUND)

        voted_option_id = None
        has_voted = False

        if full_name:
            try:
                vote_log = VoteLog.objects.get(poll_id=poll_id, voter_name=full_name)
                voted_option_id = vote_log.option_id
                has_voted = True
            except VoteLog.DoesNotExist:
                pass

        serializer = PollDetailSerializer(
            poll,
            context={
                'voted_option_ids': {voted_option_id} if voted_option_id else set(),
                'has_voted': has_voted,
                'voted_option_id': voted_option_id
            }
        )

        return Response(serializer.data)