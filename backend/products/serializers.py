# backend/products/serializers.py
from rest_framework import serializers
from .models import Product, ProductImage, Category

# ДОБАВЛЯЕМ НОВЫЙ КЛАСС ВВЕРХУ
class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        # Указываем, какие поля отдавать
        fields = ['name', 'slug']

class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['image']

class ProductSerializer(serializers.ModelSerializer):
    category = serializers.SlugField(source='category.slug', read_only=True)
    images = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ['id', 'name', 'price', 'category', 'images']
    
    def get_images(self, obj):
        request = self.context.get('request')
        image_urls = []
        for image in obj.images.all():
            image_urls.append(request.build_absolute_uri(image.image.url))
        return image_urls