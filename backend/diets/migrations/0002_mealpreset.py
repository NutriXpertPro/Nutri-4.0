from django.db import migrations, models
import django.db.models.deletion
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('diets', '0001_initial'),  # Substitua pelo nome da última migração existente
    ]

    operations = [
        migrations.CreateModel(
            name='MealPreset',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(help_text='Nome do preset', max_length=255)),
                ('meal_type', models.CharField(
                    choices=[
                        ('cafe_da_manha', 'Café da Manhã'),
                        ('almoco', 'Almoço'),
                        ('jantar', 'Jantar'),
                        ('lanche_manha', 'Lanche da Manhã'),
                        ('lanche_tarde', 'Lanche da Tarde'),
                        ('ceia', 'Ceia'),
                        ('suplemento', 'Suplemento'),
                    ],
                    help_text='Tipo de refeição para este preset',
                    max_length=20
                )),
                ('diet_type', models.CharField(
                    choices=[
                        ('balanced', 'Balanceado'),
                        ('lowcarb', 'Low Carb'),
                        ('highcarb', 'High Carb'),
                        ('ketogenic', 'Cetogênico'),
                        ('vegetarian', 'Vegetariano'),
                        ('vegan', 'Vegano'),
                        ('hypertrophy', 'Hipertrofia'),
                        ('weight_loss', 'Perda de Peso'),
                        ('weight_gain', 'Ganho de Peso'),
                        ('custom', 'Personalizado'),
                    ],
                    default='balanced',
                    help_text='Tipo de dieta para este preset',
                    max_length=20
                )),
                ('description', models.TextField(blank=True, help_text='Descrição opcional do preset', null=True)),
                ('foods', models.JSONField(default=list, help_text='Lista de alimentos no preset')),
                ('total_calories', models.IntegerField(default=0, help_text='Calorias totais calculadas')),
                ('total_protein', models.DecimalField(decimal_places=2, default=0, help_text='Proteínas totais em g', max_digits=8)),
                ('total_carbs', models.DecimalField(decimal_places=2, default=0, help_text='Carboidratos totais em g', max_digits=8)),
                ('total_fats', models.DecimalField(decimal_places=2, default=0, help_text='Gorduras totais em g', max_digits=8)),
                ('is_active', models.BooleanField(default=True, help_text='Se o preset está ativo')),
                ('is_public', models.BooleanField(default=False, help_text='Se o preset pode ser compartilhado com outros')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('nutritionist', models.ForeignKey(help_text='Nutricionista proprietário do preset', on_delete=django.db.models.deletion.CASCADE, related_name='meal_presets', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'Preset de Refeição',
                'verbose_name_plural': 'Presets de Refeições',
                'ordering': ['meal_type', 'diet_type', 'name'],
            },
        ),
        migrations.AddIndex(
            model_name='mealpreset',
            index=models.Index(fields=['nutritionist', 'meal_type'], name='diets_mealpre_nutrit_7d0b2a_idx'),
        ),
        migrations.AddIndex(
            model_name='mealpreset',
            index=models.Index(fields=['nutritionist', 'diet_type'], name='diets_mealpre_nutrit_8f1d2a_idx'),
        ),
        migrations.AddIndex(
            model_name='mealpreset',
            index=models.Index(fields=['meal_type', 'diet_type'], name='diets_mealpre_meal_t_8f1d2a_idx'),
        ),
        migrations.AddIndex(
            model_name='mealpreset',
            index=models.Index(fields=['is_active'], name='diets_mealpre_is_act_8f1d2a_idx'),
        ),
        migrations.AlterUniqueTogether(
            name='mealpreset',
            unique_together={('nutritionist', 'name', 'meal_type', 'diet_type')},
        ),
    ]