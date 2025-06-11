from django_celery_beat.models import PeriodicTask, PeriodicSchedule, IntervalSchedule
from .tasks import find_and_disable_expired_polls

schedule, created = IntervalSchedule.objects.get_or_create(
    every=10,
    period=IntervalSchedule.SECONDS,
)

PeriodicTask.objects.get_or_create(
    interval=schedule,
    name='Disable expired polls',
    task='polls.tasks.find_and_disable_expired_polls'
)