
import os
import django
import sys

# Setup Django
sys.path.append(os.path.join(os.getcwd(), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'setup.settings')
django.setup()

from django_celery_results.models import TaskResult

def list_all_tasks():
    print(f"--- Todas as Tarefas Celery Registradas ---")
    tasks = TaskResult.objects.all().order_by('-date_done')[:10]
    print(f"Total encontrado (limitado a 10): {tasks.count()}")
    
    for t in tasks:
        print(f"[{t.date_done}] {t.task_name}")
        print(f"  ID: {t.task_id}")
        print(f"  Status: {t.status}")
        print(f"  Result: {t.result[:200]}...")
        print("-" * 20)

if __name__ == "__main__":
    try:
        list_all_tasks()
    except Exception as e:
        print(f"Erro ao listar tarefas: {e}")
