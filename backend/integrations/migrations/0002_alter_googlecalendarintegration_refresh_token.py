# Generated manually to fix refresh_token field
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('integrations', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='googlecalendarintegration',
            name='refresh_token',
            field=models.TextField(
                blank=True,
                help_text='OAuth 2.0 Refresh Token',
                null=True,
                verbose_name='Token de Atualização'
            ),
        ),
    ]