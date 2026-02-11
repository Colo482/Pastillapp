from django.db import models
from rest_framework import serializers

class Paciente(models.Model):
    nombre = models.CharField(max_length=100, verbose_name="Nombre")
    apellido = models.CharField(max_length=100, verbose_name="Apellido")
    telefono = models.CharField(max_length=20, blank=True, null=True)
    fecha_registro = models.DateTimeField(auto_now_add=True)

    def get_nombre_completo(self):
        return f"{self.nombre} {self.apellido}"
    
    # Esto sirve para que en el panel de Django y en los selects aparezca el nombre, no se q onda dsp veo si me da error lo saco
    def __str__(self):
        return self.__get_nombre_completo()

    class Meta:
        verbose_name = "Paciente"
        verbose_name_plural = "Pacientes"

