from django import forms
from .models import LabExam

class LabExamForm(forms.ModelForm):
    class Meta:
        model = LabExam
        fields = ['name', 'date', 'attachment']
        widgets = {
            'date': forms.DateInput(attrs={'type': 'date'}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Adiciona a classe form-control a todos os campos
        for field_name, field in self.fields.items():
            if field.widget.attrs.get('class'):
                field.widget.attrs['class'] += ' form-control'
            else:
                field.widget.attrs['class'] = 'form-control'
