from django.shortcuts import render
from .serializers import VoteSerializer
from .models import VoteLog
from rest_framework.views import APIView
from .tasks import process_vote
from rest_framework.response import Response
from rest_framework import status
import logging

logger = logging.getLogger(__name__)

# Create your views here.
class VoteView(APIView):
    def post(self, request):
        logger.info("hi there1")
        serializer = VoteSerializer(data=request.data)
        if serializer.is_valid():
            # Extract validated data
            poll_id = serializer.validated_data['poll_id']
            option_id = serializer.validated_data['option_id']
            voter_name = serializer.validated_data['voter_name']
            logger.info("hi there2")
            # Enqueue Celery task (asynchronously)
            process_vote.delay(poll_id, option_id, voter_name)

            return Response(
                {"message": "Vote accepted and being processed."},
                status=status.HTTP_202_ACCEPTED
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)