from rest_framework import serializers
from .models import Poll, Option, VoteLog

class OptionSerializer(serializers.ModelSerializer):
    voted = serializers.SerializerMethodField()

    class Meta:
        model = Option
        fields = ['id', 'text', 'vote_count', 'voted']

    def get_voted(self, option):
        voted_option_ids = self.context.get('voted_option_ids', set())
        return option.id in voted_option_ids


class PollCreateSerializer(serializers.ModelSerializer):
    options = OptionSerializer(many=True, required=True)

    class Meta:
        model = Poll
        fields = ['id', 'title', 'description', 'creator_name', 'end_time', 'options']
        read_only_fields = ['created_at']

    def create(self, validated_data):
        options_data = validated_data.pop('options')
        poll = Poll.objects.create(**validated_data)
        for option_data in options_data:
            Option.objects.create(poll=poll, **option_data)
        return poll


class PollListSerializer(serializers.ModelSerializer):
    options = serializers.SerializerMethodField()
    has_voted = serializers.SerializerMethodField()

    class Meta:
        model = Poll
        fields = ['id', 'title', 'created_at', 'creator_name', 'end_time', 'options', 'has_voted']

    def get_has_voted(self, poll):
        voted_poll_ids = self.context.get('voted_poll_ids', set())
        return poll.id in voted_poll_ids

    def get_options(self, poll):
        voted_option_ids = self.context.get('voted_option_ids', set())
        serializer = OptionSerializer(poll.options.all(), many=True, context={'voted_option_ids': voted_option_ids})
        return serializer.data


class PollDetailSerializer(serializers.ModelSerializer):
    options = serializers.SerializerMethodField()
    has_voted = serializers.SerializerMethodField()
    voted_option_id = serializers.SerializerMethodField()

    class Meta:
        model = Poll
        fields = [
            'id',
            'title',
            'description',
            'creator_name',
            'end_time',
            'options',
            'has_voted',
            'voted_option_id'
        ]

    def get_options(self, poll):
        voted_option_ids = self.context.get('voted_option_ids', set())
        return OptionSerializer(
            poll.options.all(),  # fixed typo
            many=True,
            context={'voted_option_ids': voted_option_ids}
        ).data

    def get_has_voted(self, poll):
        return self.context.get('has_voted', False)

    def get_voted_option_id(self, poll):
        return self.context.get('voted_option_id')