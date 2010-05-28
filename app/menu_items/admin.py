from app.menu_items.models import Category, MenuItem, Ingredient, MenuIngredient, MenuPrepStep, MenuStorageStep, MenuCookStep, MenuPresentationStep, Allergen, Flatware, KegAllergen
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

class FlatwareMenuItemInline(admin.TabularInline):
    model = Flatware.menuItems.through

class MenuItemAdmin(admin.ModelAdmin):
	search_fields = ['name']
	inlines = [IngredientInline, FlatwareMenuItemInline, MenuPrepStepInline, MenuStorageStepInline, MenuCookStepInline, MenuPresentationStepInline]
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

# === Ingredient ==============================================================
class IngredientAdmin(admin.ModelAdmin):
	search_fields = ['name']
	ordering = ('name',)
	#inlines = [AllergenIngredientInline, IngredientInline]
	inlines = [IngredientInline]

# === Flatware ================================================================
class FlatwareAdmin(admin.ModelAdmin):
	search_fields = ['name']
	ordering = ('name',)
	exclude = ('menuItems',)

# === Allergans ================================================================
#class AllergenIngredientInline(admin.TabularInline):
#    model = Allergen.ingredients.through
#
#class AllergenAdmin(admin.ModelAdmin):
#    search_fields = ['name']
#    ordering = ('name',)
#    inlines = [AllergenIngredientInline]
#    exclude = ('ingredients',)

class KegAllergenMenuItemInline(admin.TabularInline):
	model = KegAllergen.menuItems.through

class KegAllergenAdmin(admin.ModelAdmin):
	search_fields = ['name']
	ordering = ('name',)
	inlines = [KegAllergenMenuItemInline,]
	exclude = ('menuItems',)

# === Register Admin Classes ==================================================
admin.site.register(MenuItem, MenuItemAdmin)
admin.site.register(Category, CategoryAdmin)
admin.site.register(Ingredient, IngredientAdmin)
admin.site.register(Flatware, FlatwareAdmin)

#admin.site.register(Allergen, AllergenAdmin)
admin.site.register(KegAllergen, KegAllergenAdmin)


#admin.site.register(MenuIngredient)
#admin.site.register(MenuPrepStep)
#admin.site.register(MenuCookStep)
#admin.site.register(MenuStorageStep)
