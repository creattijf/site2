# backend/products/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
# Добавляем импорт CategoryViewSet
from .views import ProductViewSet, CategoryViewSet

router = DefaultRouter()
router.register(r'products', ProductViewSet, basename='product')
# ДОБАВЛЯЕМ ЭТУ СТРОКУ
router.register(r'categories', CategoryViewSet, basename='category')

urlpatterns = [
    path('', include(router.urls)),
]