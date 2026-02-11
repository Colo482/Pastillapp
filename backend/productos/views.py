from rest_framework import viewsets
from .models import Producto
from .serializers import ProductoSerializer

class ProductoViewSet(viewsets.ModelViewSet):
    # ReadOnlyModelViewSet: Solo queremos LEER los productos para el selector, no crearlos desde la web
    #Al usar ModelViewSet, Django habilita automáticamente:- GET (Listar)- POST (Crear)- PUT/PATCH (Actualizar) -> Esto es lo que necesitamos para el precio- DELETE (Borrar)
    queryset = Producto.objects.all()
    serializer_class = ProductoSerializer