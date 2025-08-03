from django.db import models

class Category(models.Model):
    # Этот отступ (4 пробела) - правильный
    name = models.CharField("Название", max_length=100)
    # Этот отступ должен быть ТОЧНО ТАКИМ ЖЕ
    slug = models.SlugField("URL-метка (slug)", max_length=100, unique=True) 

    def __str__(self):
        return self.name
        
    class Meta:
        verbose_name = "Категория"
        verbose_name_plural = "Категории"

class Product(models.Model):
    name = models.CharField("Название товара", max_length=200)
    price = models.DecimalField("Цена", max_digits=10, decimal_places=2)
    category = models.ForeignKey(Category, verbose_name="Категория", on_delete=models.PROTECT, related_name='products')
    

    
    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Товар"
        verbose_name_plural = "Товары"

class ProductImage(models.Model):
    product = models.ForeignKey(Product, related_name='images', on_delete=models.CASCADE)
    image = models.ImageField("Фотография", upload_to='products/')

    def __str__(self):
        return f"Фото для {self.product.name}"