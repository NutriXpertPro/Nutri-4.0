from django.contrib.auth.decorators import user_passes_test
from django.shortcuts import redirect
from django.contrib import messages

def nutricionista_required(function=None, redirect_field_name=None, login_url='users:nutricionista_login'):
    """
    Decorator for views that checks that the user is a nutritionist,
    redirecting to the log-in page if necessary.
    """
    actual_decorator = user_passes_test(
        lambda u: u.is_authenticated and u.user_type == 'nutricionista',
        login_url=login_url
    )
    if function:
        return actual_decorator(function)
    return actual_decorator
