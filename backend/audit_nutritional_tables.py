
import json
import os

files = {
    "TACO": "backend/taco.json",
    "TBCA": "backend/tbca_alimentos.json",
    "USDA": "backend/usda_alimentos.json"
}

def audit_file(name, path):
    print(f"\n--- Auditoria {name} ({path}) ---")
    if not os.path.exists(path):
        print("Arquivo não encontrado.")
        return

    with open(path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    total = len(data)
    stats = {
        "kcal": 0,
        "protein": 0,
        "fat": 0,
        "carbs": 0
    }

    # Define fields based on source
    if name == "TACO":
        fields = {"kcal": "energy_kcal", "protein": "protein_g", "fat": "lipid_g", "carbs": "carbohydrate_g"}
    else:
        fields = {"kcal": "energia_kcal", "protein": "proteina_g", "fat": "lipidios_g", "carbs": "carboidrato_g"}

    for item in data:
        for key, field in fields.items():
            val = item.get(field)
            if val is None or val == "" or val == "NA":
                stats[key] += 1
            elif isinstance(val, str) and val.lower() == "tr":
                pass # Traces considered valid/populated for this audit

    print(f"Total de itens: {total}")
    for key, count in stats.items():
        pct = (count / total) * 100
        print(f"Ausentes {key}: {count} ({pct:.2f}%)")

if __name__ == "__main__":
    for name, path in files.items():
        audit_file(name, path)
