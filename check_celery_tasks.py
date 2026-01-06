
import os
import django
import sys

# Setup Django
sys.path.append(os.path.join(os.getcwd(), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'setup.settings')
django.setup()

from django_celery_results.models import TaskResult
import datetime

def check_tasks():
    print("Checking recent Celery tasks...")
    # Get tasks from last hour
    last_hour = datetime.datetime.now() - datetime.timedelta(hours=1)
    tasks = TaskResult.objects.filter(date_done__gte=last_hour).order_by('-date_done')
    
    print(f"Found {tasks.count()} tasks in the last hour.")
    for t in tasks:
        print(f"Task: {t.task_name} | ID: {t.task_id} | Status: {t.status} | Result: {t.result[:100]}...")

if __name__ == "__main__":
    try:
        check_tasks()
    except Exception as e:
        print(f"Error checking tasks: {e}")
        print("Note: If TaskResult table doesn't exist, django-celery-results might not be configured.")
