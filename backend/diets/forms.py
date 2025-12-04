from django import forms
from .models import Diet
from patients.models import PatientProfile
import json

class DietForm(forms.ModelForm):
    patient = forms.ModelChoiceField(
        queryset=PatientProfile.objects.all(),
        label="Paciente",
        widget=forms.Select(attrs={
            'class': 'px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
        })
    )
    
    class Meta:
        model = Diet
        fields = ['patient', 'name', 'meals', 'substitutions']
        widgets = {
            'name': forms.TextInput(attrs={
                'class': 'px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                'placeholder': 'Nome da dieta'
            }),
            'meals': forms.HiddenInput(),
            'substitutions': forms.HiddenInput(),
        }
        labels = {
            'name': 'Nome da Dieta',
            'patient': 'Paciente'
        }

    def __init__(self, *args, **kwargs):
        user = kwargs.pop('user', None)
        super(DietForm, self).__init__(*args, **kwargs)
        if user:
            self.fields['patient'].queryset = PatientProfile.objects.filter(
                nutritionist=user
            )

    def clean_meals(self):
        meals = self.cleaned_data.get('meals')
        if isinstance(meals, str):
            try:
                meals_data = json.loads(meals)
                if not isinstance(meals_data, list):
                    raise forms.ValidationError("Meals deve ser uma lista.")
                if not meals_data:
                    raise forms.ValidationError("Pelo menos uma refeição é obrigatória.")
                return meals_data
            except json.JSONDecodeError:
                raise forms.ValidationError("Formato JSON inválido para refeições.")
        return meals

    def clean_substitutions(self):
        substitutions = self.cleaned_data.get('substitutions')
        if substitutions:
            if isinstance(substitutions, str):
                try:
                    return json.loads(substitutions)
                except json.JSONDecodeError:
                    raise forms.ValidationError("Formato JSON inválido para substituições.")
        return substitutions
