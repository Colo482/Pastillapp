from django.db import models
from pacientes_pastillas.models import Paciente
from productos.models import Producto

class Pedido(models.Model):
    paciente = models.ForeignKey(Paciente, on_delete=models.CASCADE, related_name='pedidos')
    fecha_venta = models.DateTimeField(auto_now_add=True)
    pagado = models.BooleanField(default=False, verbose_name="¿Está Pago?")
    entregado = models.BooleanField(default=False, verbose_name="¿Entregado?")

    def resumen_productos(self):
        detalles = self.detalles.filter(cantidad__gt=0)
        if not detalles:
            return "Sin productos"
        return ", ".join([f"{item.cantidad}x {item.producto.get_color_display()}" for item in detalles])
    resumen_productos.short_description = "Detalle"

    def __str__(self):
        estado_pago = "Pago" if self.pagado else "Pendiente de Pago"
        return f"Pedido {self.id} - {self.paciente.nombre} ({estado_pago})"
    
    def __str__(self):
        return f"Pedido {self.id} - {self.paciente.nombre}"
    
    @property
    def total_pedido(self):
        #suma el subtotal de cada renglon del detalle
        return sum(item.subtotal for item in self.detalles.all())
    
class DetallePedido(models.Model):
    pedido = models.ForeignKey(Pedido, related_name='detalles', on_delete=models.CASCADE)
    producto =models.ForeignKey(Producto, on_delete=models.PROTECT)
    cantidad = models.PositiveBigIntegerField(default=0)
    precio_unitario_historico = models.DecimalField(max_digits=10, decimal_places=2, editable=False, null=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.precio_unitario_historico:
            self.precio_unitario_historico = self.producto.precio_actual
        super().save(*args, **kwargs)

    @property
    def subtotal(self):
        return self.cantidad * self.precio_unitario_historico
    
    def __str__(self):
        # Cambiamos .nombre por .get_color_display() o .color
        return f"{self.cantidad} x {self.producto.get_color_display()}"
        

  
