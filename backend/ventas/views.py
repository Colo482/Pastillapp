from django.shortcuts import render
from rest_framework import viewsets
from .models import Pedido
from .serializers import PedidoSerializer

from django.contrib.auth.models import User  # Esto es para manejar usuarios
from django.http import HttpResponse         # Esto es para responder texto a la web

# Un ViewSet maneja automáticamente las acciones: 
# LIST (ver todos), CREATE (crear), RETRIEVE (ver uno), UPDATE y DELETE.
class PedidoViewSet(viewsets.ModelViewSet):
    # Definimos de dónde salen los datos (todos los pedidos ordenados por fecha)
    queryset = Pedido.objects.all().order_by('-fecha_venta')
    
    # Le decimos qué "traductor" (serializer) debe usar
    serializer_class = PedidoSerializer
# Create your views here.

# Función temporal para crear tu usuario en Render
def crear_admin_remoto(request):
    username = 'colo_admin' # Podés cambiarlo
    password = 'Pastillapp2026' # Poné una difícil
    
    if not User.objects.filter(username=username).exists():
        User.objects.create_superuser(username, 'admin@admin.com', password)
        return HttpResponse(f"✅ ¡Usuario '{username}' creado! Ya podés entrar al /admin")
    else:
        return HttpResponse(f"⚠️ El usuario '{username}' ya existe.")
