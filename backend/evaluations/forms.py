import json
from django import forms
from .models import Evaluation
from patients.models import PatientProfile
from .utils import calculate_navy_body_fat

class EvaluationForm(forms.ModelForm):
    photo_front = forms.ImageField(required=False, label='Foto de Frente')
    photo_side = forms.ImageField(required=False, label='Foto de Lado')
    photo_back = forms.ImageField(required=False, label='Foto de Costas')
    class Meta:
        model = Evaluation
        fields = [
            'patient', 'date', 'method', 'height', 'weight', 
            'body_fat', 'muscle_mass', 'body_measurements'
        ]
        labels = {
            'patient': 'Paciente',
            'date': 'Data da Avaliação',
            'method': 'Método de Avaliação',
            'height': 'Altura (m)',
            'weight': 'Peso (kg)',
            'body_fat': 'Gordura Corporal (%)',
            'muscle_mass': 'Massa Muscular (kg)',
            'body_measurements': 'Medidas Corporais (JSON)',
        }
        widgets = {
            'date': forms.DateTimeInput(attrs={'type': 'datetime-local'}),
            'body_measurements': forms.Textarea(attrs={'rows': 5, 'placeholder': 'Exemplo para Fita Métrica: {"waist": 80, "neck": 35, "hip": 95}'}),
        }

    def __init__(self, *args, **kwargs):
        user = kwargs.pop('user', None)
        super().__init__(*args, **kwargs)
        if user:
            self.fields['patient'].queryset = PatientProfile.objects.filter(nutritionist=user)
        
        # Adiciona a classe form-control a todos os campos
        for field_name, field in self.fields.items():
            if field.widget.attrs.get('class'):
                field.widget.attrs['class'] += ' form-control'
            else:
                field.widget.attrs['class'] = 'form-control'

    def clean(self):
        cleaned_data = super().clean()
        method = cleaned_data.get("method")

        if method == 'FITA_METRICA':
            patient = cleaned_data.get("patient")
            height = cleaned_data.get("height")
            body_measurements_str = cleaned_data.get("body_measurements")

            if not all([patient, height, body_measurements_str]):
                raise forms.ValidationError(
                    "Para o método da marinha, o paciente, a altura e as medidas corporais são obrigatórios."
                )

            try:
                measurements = json.loads(body_measurements_str)
                waist = measurements.get('waist')
                neck = measurements.get('neck')
                hip = measurements.get('hip') # Optional, only for females
            except (json.JSONDecodeError, AttributeError):
                raise forms.ValidationError("Medidas corporais devem ser um JSON válido com as chaves 'waist', 'neck', e 'hip' (para mulheres).")

            if not all([waist, neck]):
                raise forms.ValidationError("As medidas 'waist' (cintura) e 'neck' (pescoço) são obrigatórias no JSON.")

            gender = patient.user.gender
            if not gender:
                raise forms.ValidationError(f"O sexo do paciente '{patient}' não está definido. Edite o perfil do paciente para adicioná-lo.")

            if gender == 'F' and not hip:
                raise forms.ValidationError("A medida 'hip' (quadril) é obrigatória para pacientes do sexo feminino.")

            body_fat = calculate_navy_body_fat(
                gender=gender.lower(),
                height_m=float(height),
                waist_cm=float(waist),
                neck_cm=float(neck),
                hip_cm=float(hip) if hip else None
            )

            if body_fat is None:
                raise forms.ValidationError("Não foi possível calcular o percentual de gordura. Verifique se as medidas são válidas.")
            
            cleaned_data['body_fat'] = body_fat

        return cleaned_data