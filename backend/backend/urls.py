# backend/urls.py
from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Rutas de autenticación (Login)
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Rutas de tus módulos actuales
    path('api/productos/', include('productos.urls')),
    path('api/pacientes/', include('pacientes_pastillas.urls')),
    path('api/ventas/', include('ventas.urls')),
    path('api/gastos/', include('gastos.urls')),
]