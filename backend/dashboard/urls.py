from django.urls import path
from .views import DashboardStatsView, DashboardAppointmentsView, DashboardFeaturedPatientView, PatientDashboardView, DashboardBirthdaysView

urlpatterns = [
    path('stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
    path('appointments/today/', DashboardAppointmentsView.as_view(), name='dashboard-appointments-today'),
    path('patients/featured/', DashboardFeaturedPatientView.as_view(), name='dashboard-featured-patient'),
    path('patients/birthdays/', DashboardBirthdaysView.as_view(), name='dashboard-birthdays'),
    path('patient/', PatientDashboardView.as_view(), name='dashboard-patient'),
]


