from django.contrib import admin
from .models import Producto

@admin.register(Producto)
class ProductoAdmin(admin.ModelAdmin):
    # Esto arma las columnas de la tabla
    list_display = ('color', 'precio_actual', 'stock', 'ultima_actualizacion')
    
    # Esto te deja editar precio y stock sin entrar al producto
    list_editable = ('precio_actual', 'stock')
    
    # Buscador por color
    search_fields = ('color',)
