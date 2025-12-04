from django import forms
from patients.models import PatientProfile


class AppointmentForm(forms.Form):
    patient = forms.ModelChoiceField(
        queryset=PatientProfile.objects.none(),
        label="Paciente",
        widget=forms.Select(attrs={"class": "form-select w-full"}),
    )
    date = forms.DateField(
        label="Data",
        widget=forms.DateInput(attrs={"type": "date", "class": "form-input w-full"}),
    )
    time = forms.TimeField(
        label="Hora",
        widget=forms.TimeInput(attrs={"type": "time", "class": "form-input w-full"}),
    )
    notes = forms.CharField(
        label="Notas",
        widget=forms.Textarea(attrs={"rows": 4, "class": "form-textarea w-full"}),
        required=False,
    )

    def __init__(self, *args, **kwargs):
        user = kwargs.pop("user", None)
        super(AppointmentForm, self).__init__(*args, **kwargs)
        if user:
            self.fields["patient"].queryset = PatientProfile.objects.filter(
                nutritionist=user
            )
