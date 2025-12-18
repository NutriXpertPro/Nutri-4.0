import os
import django
import sys
import hashlib
from django.conf import settings

# Setup Django
sys.path.append(r'c:\Nutri 4.0\backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from diets.models import AlimentoMedidaIBGE, FavoriteFood
from django.contrib.auth import get_user_model

def run_debug():
    print("--- DEBUG FAVORITE LOGIC ---")
    User = get_user_model()
    # Assume user is Anderson (first user)
    # But for script we can mock keys
    
    search_term = "arroz"
    print(f"Searching for '{search_term}' in IBGE...")
    
    # 1. Simulate Search Query
    ibge_qs = AlimentoMedidaIBGE.objects.filter(nome_alimento__icontains=search_term)\
                                        .values('nome_alimento')\
                                        .distinct()\
                                        .order_by('nome_alimento')[:5]
    
    print(f"Found {len(ibge_qs)} items.")
    
    target_item = None
    target_md5 = None
    
    for item in ibge_qs:
        name = item['nome_alimento']
        md5_id = hashlib.md5(name.encode('utf-8')).hexdigest()
        print(f"Item: '{name}' | MD5: {md5_id}")
        if target_item is None:
            target_item = name
            target_md5 = md5_id
    
    if not target_item:
        print("No items found.")
        return

    print(f"\n--- SIMULATING FAVORITE: {target_item} ({target_md5}) ---")
    
    # 2. Simulate User Favorites Keys
    # Backend View logic: user_fav_keys.add(f"{f.food_source}_{f.food_id}")
    # User Favorited: SOURCE=IBGE, ID=target_md5
    
    user_fav_keys = {f"IBGE_{target_md5}"}
    ibge_fav_names = {target_item}
    
    print(f"User Fav Keys: {user_fav_keys}")
    print(f"User Fav Names: {ibge_fav_names}")
    
    print("\n--- RUNNING SEARCH LOGIC AGAIN ---")
    
    # 3. Simulate View Split Logic
    qs = AlimentoMedidaIBGE.objects.filter(nome_alimento__icontains=search_term)\
                                   .values('nome_alimento')\
                                   .distinct()\
                                   .order_by('nome_alimento')
                                   
    # Prioritize Favorites
    # Logic from Views: ibge_favorites = ibge_qs.filter(nome_alimento__in=ibge_fav_names)
    
    favs_qs = qs.filter(nome_alimento__in=ibge_fav_names)
    print(f"Favs QuerySet matched: {favs_qs.count()} items")
    if favs_qs.count() > 0:
        print(f"Matched Item Name: '{favs_qs[0]['nome_alimento']}'")
    
    # Check is_favorite flag calculation
    print("\nChecking Loop Calculation:")
    matched = False
    for item in favs_qs:
        name = item['nome_alimento']
        fake_id = hashlib.md5(name.encode('utf-8')).hexdigest()
        key = f"IBGE_{fake_id}"
        is_fav = key in user_fav_keys
        print(f"Loop Item: '{name}' | Key: {key} | Is In Keys? {is_fav}")
        if is_fav: matched = True

    if matched:
        print("\nSUCCESS: Logic holds. Item is marked favorite.")
    else:
        print("\nFAILURE: Logic broken. Item NOT marked favorite.")

run_debug()
