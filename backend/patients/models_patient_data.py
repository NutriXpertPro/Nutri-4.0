from django.db import models
from django.conf import settings
from patients.models import PatientProfile

class PatientMetric(models.Model):
    """
    Registro diário de métricas do paciente (calorias, água, foco).
    """
    patient = models.ForeignKey(
        PatientProfile,
        on_delete=models.CASCADE,
        related_name='metrics'
    )
    date = models.DateField(auto_now_add=True)
    
    # Metrics
    calories_consumed = models.IntegerField(default=0)
    calories_goal = models.IntegerField(default=2000)
    
    water_consumed = models.DecimalField(max_digits=4, decimal_places=2, default=0)  # in liters
    water_goal = models.DecimalField(max_digits=4, decimal_places=2, default=2.5)
    
    focus_score = models.IntegerField(default=0)  # 0-100
    focus_goal = models.IntegerField(default=100)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'patient_metrics'
        ordering = ['-date']
        unique_together = ['patient', 'date']
    
    def __str__(self):
        return f"{self.patient} - {self.date}"


class MealCheckIn(models.Model):
    """
    Registro de check-in de refeições.
    """
    patient = models.ForeignKey(
        PatientProfile,
        on_delete=models.CASCADE,
        related_name='meal_checkins'
    )
    meal = models.ForeignKey(
        'diets.Meal',  # Assuming Meal model exists in diets app
        on_delete=models.CASCADE,
        related_name='checkins'
    )
    checked_in_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'meal_checkins'
        ordering = ['-checked_in_at']
        unique_together = ['patient', 'meal', 'checked_in_at']
    
    def __str__(self):
        return f"{self.patient} - {self.meal} - {self.checked_in_at}"


class ProgressPhoto(models.Model):
    """
    Fotos de progresso do paciente (frente, lado, costas).
    """
    ANGLE_CHOICES = [
        ('front', 'Frente'),
        ('side', 'Lado'),
        ('back', 'Costas'),
    ]
    
    patient = models.ForeignKey(
        PatientProfile,
        on_delete=models.CASCADE,
        related_name='progress_photos'
    )
    angle = models.CharField(max_length=10, choices=ANGLE_CHOICES)
    photo = models.ImageField(upload_to='progress_photos/%Y/%m/')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'progress_photos'
        ordering = ['-uploaded_at']
    
    def __str__(self):
        return f"{self.patient} - {self.angle} - {self.uploaded_at.date()}"


class BodyMeasurement(models.Model):
    """
    Medidas corporais do paciente.
    """
    patient = models.ForeignKey(
        PatientProfile,
        on_delete=models.CASCADE,
        related_name='body_measurements'
    )
    date = models.DateField(auto_now_add=True)
    
    # Measurements in cm
    waist = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    arms = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    legs = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    glutes = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'body_measurements'
        ordering = ['-date']
    
    def __str__(self):
        return f"{self.patient} - {self.date}"


class AppointmentConfirmation(models.Model):
    """
    Confirmação de consultas por pacientes.
    """
    STATUS_CHOICES = [
        ('pending', 'Pendente'),
        ('confirmed', 'Confirmada'),
        ('rejected', 'Rejeitada'),
    ]
    
    appointment = models.OneToOneField(
        'appointments.Appointment',  #  Assuming Appointment model exists
        on_delete=models.CASCADE,
        related_name='confirmation'
    )
    patient = models.ForeignKey(
        PatientProfile,
        on_delete=models.CASCADE,
        related_name='appointment_confirmations'
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    confirmed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'appointment_confirmations'
    
    def __str__(self):
        return f"{self.appointment} - {self.status}"
    
    def __str__(self):
        return f"{self.patient} - {self.date}"

class ClinicalNote(models.Model):
    """
    Anotações clínicas rápidas sobre o paciente.
    """
    patient = models.ForeignKey(
        PatientProfile,
        on_delete=models.CASCADE,
        related_name='notes'
    )
    title = models.CharField(max_length=255, blank=True, null=True)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'clinical_notes'
        ordering = ['-created_at']

    def __str__(self):
        return f"Nota para {self.patient} em {self.created_at.date()}"
class MealPhoto(models.Model):
    """
    Fotos de refeições registradas pelos pacientes.
    """
    patient = models.ForeignKey(
        PatientProfile,
        on_delete=models.CASCADE,
        related_name='meal_photos'
    )
    meal = models.ForeignKey(
        'diets.Meal',
        on_delete=models.CASCADE,
        related_name='photos'
    )
    photo = models.ImageField(upload_to='meal_photos/%Y/%m/')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'meal_photos'
        ordering = ['-uploaded_at']
    
    def __str__(self):
        return f"Foto de {self.meal.name} - {self.patient.user.name} - {self.uploaded_at.date()}"
