from django.db import models
from django.contrib.auth.models import User

class Gasto(models.Model):
    TIPO_CHOICES = [
        ('INGRESO', 'Ingreso'),
        ('EGRESO', 'Egreso'),
    ]
    
    # Vinculamos el gasto al usuario para seguridad
    user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name="Usuario")
    descripcion = models.CharField(max_length=255, verbose_name="Descripción")
    monto = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Monto")
    fecha = models.DateField(auto_now_add=True, verbose_name="Fecha")
    tipo = models.CharField(max_length=10, choices=TIPO_CHOICES, verbose_name="Tipo")
    categoria = models.CharField(max_length=100, blank=True, null=True, verbose_name="Categoría")

    class Meta:
        verbose_name = "Movimiento"
        verbose_name_plural = "Movimientos Financieros"
        ordering = ['-fecha']

    def __str__(self):
        return f"{self.tipo}: {self.descripcion} - ${self.monto}"