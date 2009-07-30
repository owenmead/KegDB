from app.menu_items.models import Category, MenuItem, Ingredient, MenuIngredient
from django.contrib import admin

class MenuItemInline(admin.TabularInline):
	model = MenuItem
	extra = 1

class CategoryAdmin(admin.ModelAdmin):
	search_fields = ['name']
	fieldsets = [
		(None,               {'fields': ['name']}),
	]
	inlines = [MenuItemInline]

admin.site.register(MenuItem)
admin.site.register(Category, CategoryAdmin)
admin.site.register(Ingredient)
admin.site.register(MenuIngredient)