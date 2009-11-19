from app.menu_items.models import Category, MenuItem, Ingredient, MenuIngredient, MenuPrepStep, MenuStorageStep, MenuCookStep, MenuPresentationStep, Allergen
from django.contrib import admin

# === Menu Item Admin =========================================================
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
	ordering = ('name',)

# === Category Admin ==========================================================
class MenuItemInline(admin.TabularInline):
	model = MenuItem
	extra = 1

class CategoryAdmin(admin.ModelAdmin):
	search_fields = ['name']
	fieldsets = [
		(None,               {'fields': ['name']}),
	]
	inlines = [MenuItemInline]
	ordering = ('name',)

# === Ingredient / Allergen Admin =============================================
class AllergenIngredientInline(admin.TabularInline):
    model = Allergen.ingredients.through

class AllergenAdmin(admin.ModelAdmin):
    ordering = ('name',)
    inlines = [AllergenIngredientInline]
    exclude = ('ingredients',)

class IngredientAdmin(admin.ModelAdmin):
    ordering = ('name',)
    inlines = [AllergenIngredientInline]

admin.site.register(MenuItem, MenuItemAdmin)
admin.site.register(Category, CategoryAdmin)
admin.site.register(Allergen, AllergenAdmin)
admin.site.register(Ingredient, IngredientAdmin)

#admin.site.register(MenuIngredient)
#admin.site.register(MenuPrepStep)
#admin.site.register(MenuCookStep)
#admin.site.register(MenuStorageStep)
