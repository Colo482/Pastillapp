from django.contrib import admin
from .models import Producto

@admin.register(Producto)
class ProductoAdmin(admin.ModelAdmin):
    list_display = ('color', 'precio_actual', 'stock', 'ultima_actualizacion')
    list_editable = ('precio_actual', 'stock') # Editá rápido desde la lista
    list_filter = ('color',)
    search_fields = ('color',)
    