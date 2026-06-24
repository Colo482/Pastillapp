from rest_framework import viewsets, permissions
from .models import Gasto
from .serializers import GastoSerializer

class GastoViewSet(viewsets.ModelViewSet):
    # Agregamos esto para que el Router pueda identificar el nombre base
    queryset = Gasto.objects.all() 
    serializer_class = GastoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Esta es la lógica que ya tenías y que filtra por usuario
        return Gasto.objects.filter(user=self.request.user).order_by('-fecha')

    def perform_create(self, serializer):
        # Asigna el usuario actual al crear un nuevo gasto
        serializer.save(user=self.request.user)