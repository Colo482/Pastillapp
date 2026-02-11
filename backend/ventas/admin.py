from django.contrib import admin
from .models import Pedido, DetallePedido
from productos.models import Producto

class DetallePedidoInline(admin.TabularInline):
    model = DetallePedido
    extra = 0
    max_num = 3
    # Definimos los campos que se verán
    fields = ('producto', 'cantidad', 'precio_unitario_historico', 'subtotal_display')
    
    # Quitamos la doble definición de readonly_fields y usamos un método
    def get_readonly_fields(self, request, obj=None):
        if obj: # Si el pedido ya existe (edición)
            return ('producto', 'precio_unitario_historico', 'subtotal_display')
        else: # Si el pedido es nuevo
            return ('precio_unitario_historico', 'subtotal_display')

    def subtotal_display(self, obj):
        if obj and obj.cantidad and obj.precio_unitario_historico:
            return f"${obj.cantidad * obj.precio_unitario_historico}"
        return "$0.00"
    subtotal_display.short_description = "Subtotal"

    # RECUERDA agregar aquí el método get_formset que hicimos antes 
    # para que te precargue las 3 pastillas automáticamente:
    def get_formset(self, request, obj=None, **kwargs):
        formset = super().get_formset(request, obj, **kwargs)
        if obj is None:
            productos = Producto.objects.all()
            initial = [{'producto': p.id} for p in productos]
            class _CustomFormSet(formset):
                def __init__(self, *args, **kwargs):
                    kwargs['initial'] = initial
                    super().__init__(*args, **kwargs)
                    self.extra = len(initial)
            return _CustomFormSet
        return formset

@admin.register(Pedido)
class PedidoAdmin(admin.ModelAdmin):
    # Agregamos 'resumen_productos' a la lista
    list_display = ('id', 'paciente', 'resumen_productos', 'total_pedido', 'pagado', 'entregado')
    list_editable = ('pagado', 'entregado')
    list_filter = ('pagado', 'entregado', 'fecha_venta')
    inlines = [DetallePedidoInline]

    # Para que el detalle se vea más grande y no tengas que entrar si no quieres
    readonly_fields = ('total_pedido_display',)

    def total_pedido_display(self, obj):
        return f"${obj.total_pedido}"
    total_pedido_display.short_description = "Total del Pedido"