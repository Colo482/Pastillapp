from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Ruta para los Productos (Pastillas) -> http://127.0.0.1:8000/api/productos/
    path('api/productos/', include('productos.urls')),

    # Ruta para los Pacientes -> http://127.0.0.1:8000/api/pacientes/
    path('api/pacientes/', include('pacientes_pastillas.urls')),

    # Ruta para las Ventas (Pedidos) -> http://127.0.0.1:8000/api/ventas/
    path('api/ventas/', include('ventas.urls')),
]