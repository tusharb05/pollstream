from django.db import models

# Create your models here.
class Poll(models.Model):
    title = models.CharField(max_length=50)
    description = models.CharField(max_length=500, blank=True)
    creator_name = models.CharField(max_length=100, blank=False)
    created_at = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField()
    is_active = models.BooleanField(default=True)
    total_votes = models.PositiveBigIntegerField(default=0)

    def __str__(self):
        return self.title


class Option(models.Model):
    poll = models.ForeignKey(Poll, related_name='options', on_delete=models.CASCADE)
    text = models.CharField(max_length=255)
    vote_count = models.BigIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.text
    

class VoteLog(models.Model):
    poll_id = models.ForeignKey(Poll, on_delete=models.CASCADE, related_name='vote_logs')
    option_id = models.ForeignKey(Option, on_delete=models.CASCADE, related_name='vote_logs')    
    voter_name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('poll_id', 'voter_name')
        indexes = [
            models.Index(fields=['poll_id', 'voter_name']),
        ]

    def __str__(self):
        return f"{self.voter_name} voted on poll {self.poll_id}"