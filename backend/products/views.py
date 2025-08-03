# backend/products/views.py
from rest_framework import viewsets
# Добавляем импорт Category
from .models import Product, Category 
# Добавляем импорт CategorySerializer
from .serializers import ProductSerializer, CategorySerializer 

class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Product.objects.all().order_by('id')
    serializer_class = ProductSerializer

# ДОБАВЛЯЕМ НОВЫЙ КЛАСС НИЖЕ
class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint that allows categories to be viewed.
    """
    queryset = Category.objects.all().order_by('name')
    serializer_class = CategorySerializer