from rest_framework import serializers
from .models import Producto

class ProductoSerializer(serializers.ModelSerializer):
    # Le avisamos que este campo viene de un método del modelo y es solo para leer
    get_color_display = serializers.ReadOnlyField()

    class Meta:
        model = Producto
        fields = ['id', 'color', 'get_color_display', 'precio_actual', 'stock']