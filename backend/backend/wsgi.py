import os
from django.core.wsgi import get_wsgi_application
from django.core.management import call_command
from django.contrib.auth import get_user_model

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
application = get_wsgi_application()

# --- BLOQUE PARA CREAR TU ADMIN ---
try:
    User = get_user_model()
    # Cambiá 'admin' y 'tu_password' por lo que quieras usar
    if not User.objects.filter(username='Colo').exists():
        User.objects.create_superuser('Colo', 'ignaciobonifacio4@gmail.com', 'Fausto2021')
        print("Superusuario 'Colo' creado con éxito.")
    else:
        print("El usuario ya existe, no se creó de nuevo.")
except Exception as e:
    print(f"Error creando superusuario: {e}")
# ----------------------------------