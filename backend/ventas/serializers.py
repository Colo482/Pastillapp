from rest_framework import serializers
from .models import Pedido, DetallePedido
from productos.models import Producto 

# --- Serializer para los renglones (Pastillas individuales) ---
class DetallePedidoSerializer(serializers.ModelSerializer):
    # Esto es para LEER el nombre (ej: "Pastilla Roja")
    nombre_producto = serializers.ReadOnlyField(source='producto.get_color_display')
    
    class Meta:
        model = DetallePedido
        # Para GUARDAR solo necesitamos 'producto' (el ID) y 'cantidad'
        fields = ['id', 'producto', 'nombre_producto', 'cantidad', 'subtotal']

# --- Serializer para la Cabecera (El Pedido en sí) ---
class PedidoSerializer(serializers.ModelSerializer):
    # 'detalles' usa el serializer de arriba.
    # Al quitar read_only=True, permitimos que React nos mande datos acá.
    detalles = DetallePedidoSerializer(many=True) 
    
    nombre_paciente = serializers.ReadOnlyField(source='paciente.nombre')
    total = serializers.ReadOnlyField(source='total_pedido')

    class Meta:
        model = Pedido
        fields = ['id', 'paciente', 'nombre_paciente', 'fecha_venta', 'pagado', 'entregado', 'total', 'detalles']

    # --- AQUÍ ESTÁ LA LÓGICA DEL STOCK (Método create) ---
    def create(self, validated_data):
        # 1. Separamos los datos: Sacamos la lista de pastillas ('detalles') de la información del pedido
        detalles_data = validated_data.pop('detalles')
        
        # 2. Creamos el Pedido en la base de datos (la cabecera)
        pedido = Pedido.objects.create(**validated_data)
        
        # 3. Recorremos cada pastilla que se vendió
        for detalle_data in detalles_data:
            # A. Guardamos el renglón de la venta vinculado al pedido
            DetallePedido.objects.create(pedido=pedido, **detalle_data)
            
            # --- INICIO DEL DESCUENTO DE STOCK ---
            
            # B. Identificamos qué producto es (Django ya nos da el objeto Producto gracias al serializer)
            producto_a_actualizar = detalle_data['producto']
            
            # C. Hacemos la resta matemática: Stock Actual - Cantidad Vendida
            # (Ej: 100 - 5 = 95)
            producto_a_actualizar.stock -= detalle_data['cantidad']
            
            # D. Guardamos el cambio en la tabla de Productos
            producto_a_actualizar.save()
            
            # --- FIN DEL DESCUENTO DE STOCK ---
            
        return pedido