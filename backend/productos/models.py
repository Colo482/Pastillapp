from django.db import models

class Producto(models.Model):
    COLORES_CHOICES = [
        ('LILA', 'Pastilla Lila'),
        ('NARANJA', 'Pastilla Naranja'),
        ('VERDE', 'Pastilla Verde')
    ]

    color = models.CharField(
        max_length=10,
        choices=COLORES_CHOICES,
        unique=True,
        verbose_name="Color de Pastilla"
        )

    precio_actual= models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name="Precio Actual"
        )

    stock = models.IntegerField(default=0, verbose_name="Stock Disponible")
    ultima_actualizacion= models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name= "Pastilla"
        verbose_name_plural= "Pastillas"
        ordering= ['-precio_actual']#para que las lilas q son las caras salgan primero

    def __str__(self):
        return f"Pastilla {self.get_color_display()} -${self.precio_actual}"
    
