from django.shortcuts import render
from rest_framework import viewsets
from .models import Pedido
from .serializers import PedidoSerializer

# Un ViewSet maneja automáticamente las acciones: 
# LIST (ver todos), CREATE (crear), RETRIEVE (ver uno), UPDATE y DELETE.
class PedidoViewSet(viewsets.ModelViewSet):
    # Definimos de dónde salen los datos (todos los pedidos ordenados por fecha)
    queryset = Pedido.objects.all().order_by('-fecha_venta')
    
    # Le decimos qué "traductor" (serializer) debe usar
    serializer_class = PedidoSerializer
# Create your views here.
