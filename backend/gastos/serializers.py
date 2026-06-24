from rest_framework import serializers
from .models import Gasto

class GastoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Gasto
        fields = '__all__'
        # Esto hace que el usuario se asigne automáticamente al crear
        read_only_fields = ['user']