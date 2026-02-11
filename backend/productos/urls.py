from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProductoViewSet

router = DefaultRouter()
# Al dejar r'' vacío, la ruta será directamente /api/productos/
router.register(r'', ProductoViewSet)

urlpatterns = [
    path('', include(router.urls)),
]