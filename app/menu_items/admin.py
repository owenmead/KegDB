from app.menu_items.models import Category, MenuItem, Ingredient, MenuIngredient, MenuPrepStep
from django.contrib import admin

class MenuPrepStepInline(admin.TabularInline):
	model = MenuPrepStep
	extra = 1

class MenuItemAdmin(admin.ModelAdmin):
	inlines = [MenuPrepStepInline]

class MenuItemInline(admin.TabularInline):
	model = MenuItem
	extra = 1

class CategoryAdmin(admin.ModelAdmin):
	search_fields = ['name']
	fieldsets = [
		(None,               {'fields': ['name']}),
	]
	inlines = [MenuItemInline]

admin.site.register(MenuItem, MenuItemAdmin)
admin.site.register(Category, CategoryAdmin)
admin.site.register(Ingredient)
admin.site.register(MenuIngredient)
admin.site.register(MenuPrepStep)