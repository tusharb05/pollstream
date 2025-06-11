from django.db import models

# Create your models here.
class VoteLog(models.Model):
    poll_id = models.IntegerField()   # Foreign key across microservices
    option_id = models.IntegerField()
    voter_name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=['poll_id'], name='idx_vote_log_poll'),
            models.Index(fields=['option_id'], name='idx_vote_log_option'),
        ]