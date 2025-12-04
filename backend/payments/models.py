from django.db import models
from django.conf import settings
from patients.models import PatientProfile

# Create your models here.


class Payment(models.Model):
    """
    Representa um registro de pagamento no sistema, associado a um usuário
    e, opcionalmente, a um paciente.
    """
    STATUS_CHOICES = [
        ("PENDING", "Pendente"),
        ("PAID", "Pago"),
        ("CANCELLED", "Cancelado"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="payments"
    )
    patient = models.ForeignKey(
        PatientProfile,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="payments",
    )
    asaas_id = models.CharField(max_length=255, unique=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default="PENDING", db_index=True) # Adicionado para performance
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        """
        Retorna uma representação em string do pagamento, incluindo o ID
        e o nome do paciente (se aplicável).
        """
        # Garante que o nome do paciente seja exibido, se houver um.
        patient_name = self.patient.user.name if self.patient else "N/A"
        return f"Pagamento {self.id} - {patient_name}"
