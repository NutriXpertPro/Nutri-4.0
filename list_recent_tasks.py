
import os
import django
import sys
from datetime import datetime, timedelta

# Setup Django
sys.path.append(os.path.join(os.getcwd(), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'setup.settings')
django.setup()

from django_celery_results.models import TaskResult

def list_recent_tasks():
    print(f"--- Tarefas Recentes (últimos 30 min) ---")
    now = datetime.now()
    since = now - timedelta(minutes=30)
    
    tasks = TaskResult.objects.filter(date_done__gte=since).order_by('-date_done')
    print(f"Total encontrado: {tasks.count()}")
    
    for t in tasks:
        print(f"[{t.date_done}] {t.task_name}")
        print(f"  ID: {t.task_id}")
        print(f"  Status: {t.status}")
        if t.status == 'FAILURE':
            print(f"  Erro: {t.result}")
        print("-" * 20)

if __name__ == "__main__":
    try:
        list_recent_tasks()
    except Exception as e:
        print(f"Erro ao listar tarefas: {e}")
