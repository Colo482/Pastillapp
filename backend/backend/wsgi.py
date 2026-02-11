import os
import sys
from django.core.wsgi import get_wsgi_application
from django.core.management import call_command

# 1. Configuramos la variable de entorno para que Django sepa dónde están los settings
# Ojo: el nombre del parámetro debe ser 'DJANGO_SETTINGS_MODULE' (todo en mayúsculas)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

# 2. Inicializamos la aplicación
application = get_wsgi_application()

# 3. Intentamos correr las migraciones automáticamente
# Esto es lo que va a crear la tabla 'auth_user' que te falta en Neon
try:
    print("Iniciando proceso de migración en la nube...")
    call_command('migrate', interactive=False)
    print("Migraciones completadas exitosamente.")
except Exception as e:
    print(f"Alerta: No se pudieron correr las migraciones: {e}")