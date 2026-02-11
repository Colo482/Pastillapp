from rest_framework import viewsets
from .models import Paciente
from .serializers import PacienteSerializer # Importamos el que creamos recién

class PacienteViewSet(viewsets.ModelViewSet):
    # Traemos todos los pacientes de la base de datos
    queryset = Paciente.objects.all()
    # Le asignamos el traductor (serializer)
    serializer_class = PacienteSerializer