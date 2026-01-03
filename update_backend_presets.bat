#!/bin/bash
# Script para atualizar o backend com as novas funcionalidades

echo "Atualizando o backend com as novas funcionalidades..."

# Criar migrações
echo "Criando migrações para o novo modelo MealPreset..."
cd /app/backend
python manage.py makemigrations

# Aplicar migrações
echo "Aplicando migrações..."
python manage.py migrate

echo "Backend atualizado com sucesso!"