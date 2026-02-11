from rest_framework import serializers
from .models import Paciente # El punto (.) significa "buscá en esta misma carpeta"

class PacienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Paciente
        # 'id' lo crea Django solo, 'nombre' es el que definiste en models.py
        fields = ['id', 'nombre','apellido','telefono', 'fecha_registro']