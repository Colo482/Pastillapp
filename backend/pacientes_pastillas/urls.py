from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PacienteViewSet # Asegurate de tener esta ViewSet creada

# Usamos un router para que genere automáticamente las rutas GET y POST
router = DefaultRouter()
router.register(r'', PacienteViewSet, basename='paciente')

urlpatterns = [
    path('', include(router.urls)),
]