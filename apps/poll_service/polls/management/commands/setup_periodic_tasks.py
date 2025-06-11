# polls/management/commands/setup_periodic_tasks.py
from django.core.management.base import BaseCommand
from django_celery_beat.models import PeriodicTask, IntervalSchedule
import logging

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Create or update periodic tasks' # Updated help string

    def handle(self, *args, **kwargs):
        schedule, created_schedule = IntervalSchedule.objects.get_or_create(
            every=10,
            period=IntervalSchedule.SECONDS,
        )
        if created_schedule:
            logger.info(f"IntervalSchedule 'every 10 seconds' created.")
        else:
            logger.info(f"IntervalSchedule 'every 10 seconds' already exists.")

        task_name = 'Disable expired polls'
        task_path = 'polls.tasks.find_and_disable_expired_polls'
        target_queue = 'poll_service_queue'

        task, created = PeriodicTask.objects.get_or_create(
            name=task_name,
            defaults={ # These are used only if the task is being created
                'task': task_path,
                'interval': schedule,
                'queue': target_queue,
                # 'args': json.dumps(['arg1', 'arg2']), # If you have args
                # 'kwargs': json.dumps({'key': 'value'}), # If you have kwargs
                'enabled': True,
            }
        )

        if created:
            logger.info("🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥")
            logger.info(f"Periodic task '{task.name}' created and assigned to queue '{task.queue}'.")
            logger.info("🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥")
        else:
            logger.info(f"ℹ️ Periodic task '{task.name}' already exists.")
            # --- IMPORTANT: Update existing task if necessary ---
            updated_fields = []
            if task.interval != schedule:
                task.interval = schedule
                updated_fields.append('interval')
            if task.task != task_path: # If you ever change the task path
                task.task = task_path
                updated_fields.append('task')
            if task.queue != target_queue:
                task.queue = target_queue
                updated_fields.append('queue')
            if not task.enabled: # Ensure it's enabled
                task.enabled = True
                updated_fields.append('enabled')

            if updated_fields:
                task.save(update_fields=updated_fields)
                logger.info(f"Updated fields {updated_fields} for existing task '{task.name}'. Now uses queue '{task.queue}'.")
            else:
                logger.info(f"Existing task '{task.name}' is already up-to-date (queue: '{task.queue}').")
