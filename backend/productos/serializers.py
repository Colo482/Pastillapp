from rest_framework import serializers
from .models import Producto

class ProductoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Producto
        # Importante: 'precio_actual' debe coincidir con tu models.py
        fields = ['id', 'color', 'get_color_display', 'precio_actual', 'stock']