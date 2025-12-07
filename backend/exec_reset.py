from django.contrib.auth import get_user_model

User = get_user_model()
users = User.objects.all()

print("\n" + "="*50)
print("RELATÓRIO DE CREDENCIAIS (SENHAS RESETADAS)")
print("="*50)

if not users.exists():
    print("❌ NENHUM USUÁRIO ENCONTRADO NO BANCO DE DADOS!")
else:
    for user in users:
        # Força o reset independente de qualquer coisa
        user.set_password('12345678')
        user.save()
        
        print(f"\n👤 Usuário: {user.name}")
        print(f"📧 Email (Login): {user.email}")
        print(f"🔑 Senha definida para: 12345678")
        print(f"🏷️  Tipo: {user.user_type}")
        print(f"🆔 ID: {user.id}")
        print("-" * 30)

    print("\n✅ TODAS AS SENHAS FORAM DEFINIDAS PARA: 12345678")
    print("Tente fazer login com um dos emails listados acima.")
