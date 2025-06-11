from  rest_framework import serializers
from .models import VoteLog

class VoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = VoteLog
        fields = ['poll_id', 'option_id', 'voter_name']