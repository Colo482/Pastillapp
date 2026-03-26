from django.contrib import admin
from .models import Paciente

@admin.register(Paciente)
class PacienteAdmin(admin.ModelAdmin):
    # Columnas prolijas para tus clientas
    list_display = ('apellido', 'nombre', 'telefono')
    
    # Buscador por nombre, apellido o celu
    search_fields = ('apellido', 'nombre', 'telefono')