from app.menu_items.models import Category, MenuItem, Ingredient, MenuIngredient, MenuPrepStep, MenuStorageStep, MenuCookStep, MenuPresentationStep, Allergen
from django.contrib import admin

class MenuStorageStepInline(admin.TabularInline):
	model = MenuStorageStep
	extra = 1

class MenuPrepStepInline(admin.TabularInline):
	model = MenuPrepStep
	extra = 1

class MenuCookStepInline(admin.TabularInline):
	model = MenuCookStep
	extra = 1

class MenuPresentationStepInline(admin.TabularInline):
	model = MenuPresentationStep
	extra = 1

class MenuItemAdmin(admin.ModelAdmin):
	inlines = [MenuPrepStepInline, MenuStorageStepInline, MenuCookStepInline, MenuPresentationStepInline]

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
admin.site.register(MenuCookStep)
admin.site.register(MenuStorageStep)
admin.site.register(Allergen)