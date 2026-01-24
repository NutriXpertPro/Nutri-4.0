
import os
import django
import sys

# Setup Django
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'setup.settings')
django.setup()

from diets.models import AlimentoTBCA

def count_broken():
    foods = AlimentoTBCA.objects.all()
    count = 0
    mismatch_list = []
    
    for f in foods:
        p = float(f.proteina_g or 0)
        c = float(f.carboidrato_g or 0)
        g = float(f.lipidios_g or 0)
        k = float(f.energia_kcal or 0)
        
        calc_kcal = (p*4 + c*4 + g*9)
        if k > 10 and abs(k - calc_kcal) > 15:
            count += 1
            if len(mismatch_list) < 50:
                mismatch_list.append(f"{f.id} | {f.nome[:50]} | Kcal: {k} | Calc: {calc_kcal:.1f} | Diff: {abs(k-calc_kcal):.1f}")
                
    with open("broken_audit.txt", "w", encoding="utf-8") as f_out:
        f_out.write(f"TOTAL_BROKEN: {count}\n")
        f_out.write("-" * 50 + "\n")
        for m in mismatch_list:
            f_out.write(f"BROKEN: {m}\n")
            
    print(f"COUNT_START")
    print(f"TOTAL_BROKEN: {count}")
    print(f"REPORT_SAVED: broken_audit.txt")
    print(f"COUNT_END")

if __name__ == "__main__":
    count_broken()
