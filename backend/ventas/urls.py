from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PedidoViewSet

# El Router genera automáticamente las URLs para el ViewSet
# Ejemplo: /api/ventas/pedidos/ para ver todos
# Ejemplo: /api/ventas/pedidos/1/ para ver el pedido con ID 1
router = DefaultRouter()
router.register(r'pedidos', PedidoViewSet)

urlpatterns = [
    # Incluimos las rutas generadas por el router
    path('', include(router.urls)),
    
]