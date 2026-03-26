from django.contrib import admin
from .models import Paciente # Asegurate que tu modelo se llame Paciente

@admin.register(Paciente)
class PacienteAdmin(admin.ModelAdmin):
    list_display = ('apellido', 'nombre', 'telefono')
    search_fields = ('apellido', 'nombre', 'telefono')
    ordering = ('apellido',)