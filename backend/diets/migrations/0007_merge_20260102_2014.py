from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('diets', '0002_mealpreset'),
        ('diets', '0006_dietviewlog'),
    ]

    operations = [
        # Esta migrao une as duas branches de migrao conflitantes
        # A migrao 0002_mealpreset adiciona o modelo MealPreset
        # A migrao 0006_dietviewlog faz alteraes em outros modelos
        # Como no h conflito direto entre as operaes, simplesmente as unimos
    ]