from app.menu_items.models import Category, MenuItem, Ingredient, MenuIngredient, MenuPrepStep, MenuStorageStep, MenuCookStep, MenuPresentationStep, Allergen
from django.contrib import admin

# === Menu Item Admin =========================================================
class IngredientInline(admin.TabularInline):
    model = MenuIngredient
    extra = 6

class MenuStorageStepInline(admin.TabularInline):
	model = MenuStorageStep
	extra = 3

class MenuPrepStepInline(admin.TabularInline):
	model = MenuPrepStep
	extra = 6

class MenuCookStepInline(admin.TabularInline):
	model = MenuCookStep
	extra = 3

class MenuPresentationStepInline(admin.TabularInline):
	model = MenuPresentationStep
	extra = 3

class MenuItemAdmin(admin.ModelAdmin):
	search_fields = ['name']
	inlines = [IngredientInline, MenuPrepStepInline, MenuStorageStepInline, MenuCookStepInline, MenuPresentationStepInline]
	ordering = ('name',)
	save_on_top = True

# === Category Admin ==========================================================
class MenuItemInline(admin.TabularInline):
	model = MenuItem
	extra = 1

class CategoryAdmin(admin.ModelAdmin):
	search_fields = ['name']
	fieldsets = [
		(None,               {'fields': ['name']}),
	]
	#inlines = [MenuItemInline]
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
    inlines = [AllergenIngredientInline, IngredientInline]

admin.site.register(MenuItem, MenuItemAdmin)
admin.site.register(Category, CategoryAdmin)
admin.site.register(Allergen, AllergenAdmin)
admin.site.register(Ingredient, IngredientAdmin)

#admin.site.register(MenuIngredient)
#admin.site.register(MenuPrepStep)
#admin.site.register(MenuCookStep)
#admin.site.register(MenuStorageStep)
