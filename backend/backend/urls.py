from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Ruta para los Productos (Pastillas) 
    path('api/productos/', include('productos.urls')),

    # Ruta para los Pacientes 
    path('api/pacientes/', include('pacientes_pastillas.urls')),

    # Ruta para las Ventas (Pedidos)
    path('api/ventas/', include('ventas.urls')),
]