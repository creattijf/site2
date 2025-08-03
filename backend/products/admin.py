# backend/products/admin.py
from django.contrib import admin
from .models import Product, Category, ProductImage

class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'price')
    list_filter = ('category',)
    inlines = [ProductImageInline]

# ИЗМЕНЯЕМ РЕГИСТРАЦИЮ КАТЕГОРИИ
@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug')
    # ДОБАВЛЯЕМ ЭТУ СТРОКУ
    prepopulated_fields = {'slug': ('name',)} 