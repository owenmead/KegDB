from app.menu_items.models import Category, MenuItem, Allergen
from django.http import HttpResponse
#from django.core import serializers   -- little bit overkill
from django.utils import simplejson
from django.shortcuts import render_to_response, get_object_or_404

def index(request):
    return render_to_response('index.html')

def categoryList(request):
	cats = []
	for cat in Category.get_items():
		cats.append({'id': cat.id, 'name': cat.name})
	return HttpResponse(simplejson.dumps(cats))

def menuitemList(request, category_id=None):
	search = dict(is_active=True)
	if category_id:
		search['category'] =category_id

	menu_items = []
	for item in MenuItem.get_items().filter(**search):
		menu_items.append({'id': item.id, 'name': item.name, 'categoryID': item.category.id})
	return HttpResponse(simplejson.dumps(menu_items))

def displayAllergy(request, item_id):
	visited = []
	def get_allergens(menu_item):
		if menu_item.id in visited: return []
		else: visited.append(menu_item.id)

		allergens = []
		for menu_ingredient in menu_item.menuingredient_set.all():
			# Grab all the direct allergens from the ingredients
			for allergen in menu_ingredient.ingredient.allergen_set.all():
				allergens.append([allergen.name,
								  menu_ingredient.ingredient.name,
								  menu_ingredient.menuItem.name,
								  menu_ingredient.ingredient_type])

			# Search through linked ingredients for more allergies (recursively)
			linked_menu_item = menu_ingredient.ingredient.prep_item_link
			if linked_menu_item:
				allergens.extend(get_allergens(linked_menu_item))

		return allergens

	menu_item = get_object_or_404(MenuItem, pk=item_id)
	allergens = get_allergens(menu_item)
	# Sort by the ingredient type (prep | cook)
	allergens = sorted(allergens, key=lambda allergy:allergy[0])
	allergens_basic = sorted(list(set([a[0] for a in allergens])))

	data = {'menu_item' : menu_item, 'allergens' : allergens, 'allergens_basic':allergens_basic }
	return render_to_response('menuItem_allergy.html', data)

def displayMenuItem(request, item_id, display_type):
	menu_item = get_object_or_404(MenuItem, pk=item_id)

	menu_item_type = menu_item.get_type()

	if menu_item_type == MenuItem.TYPE_COOKONLY and display_type == 'prep':
		ingredient_filter = dict(ingredient_type='C', ingredient__prep_item_link__isnull=False)
	elif display_type == 'prep':
		ingredient_filter = dict(ingredient_type='P')
	elif display_type == 'cook':
		ingredient_filter = dict(ingredient_type='C')
	else:
		ingredient_filter = {}

	ingredients = []
	for mi in menu_item.menuingredient_set.all().filter(**ingredient_filter):
		linked_prep_item_id = mi.ingredient.prep_item_link and \
									mi.ingredient.prep_item_link.id or None

		ingredients.append({'name'               : mi.ingredient.name,
							'amount_imperial'    : mi.amount_imperial,
							'amount_metric'      : mi.amount_metric,
							'linked_prep_item_id': linked_prep_item_id
							})

	flatware = None
	if display_type == 'cook':
		step_set = menu_item.menucookstep_set.all()
		flatware = []
		for piece in menu_item.flatware_set.all():
			flatware.append	({ 'name' : piece.name })
	elif display_type == 'prep':
		step_set = menu_item.menuprepstep_set.all()
	else:
		step_set = []

	steps = []
	displayOrder = 0
	for step in step_set:
		if not step.isNote:
			displayOrder += 1
		steps.append({'dispOrder' : displayOrder,
					  'order'     : step.order,
					  'step'      : step.step,
					  'isNote'    : step.isNote,
					  'photo'     : step.photo and step.photo.url})

	storage = []
	displayOrder = 0
	for store in menu_item.menustoragestep_set.all():
		if not store.isNote:
			displayOrder += 1
		storage.append({'dispOrder' : displayOrder,
						'order'     : store.order,
						'step'      : store.step,
						'isNote'    : store.isNote})

	presentation = []
	displayOrder = 0
	for pres in menu_item.menupresentationstep_set.all():
		if not pres.isNote:
			displayOrder += 1
		presentation.append({'dispOrder' : displayOrder,
							 'order'     : pres.order,
							 'step'      : pres.step,
							 'isNote'    : pres.isNote})

	data = {'menu_item'    : menu_item,
			'ingredients'  : ingredients,
			'steps'        : steps,
			'storage'      : storage,
			'presentation' : presentation,
			'flatware'     : flatware,
			}

	if display_type == 'prep' and menu_item_type == MenuItem.TYPE_COOKONLY:
		display_type = 'cookONLY'
	elif display_type == 'cook' and menu_item_type == MenuItem.TYPE_PREPONLY:
		display_type = 'prepONLY'

		# FIXME: I'm SURE this can be done in a single query.
		data['usedIn'] = []
		for ing in menu_item.prepIngredients.all():
			for mi in ing.menuItems.all():
				data['usedIn'].append(mi)

	data['display_type'] = display_type

	return render_to_response('menuItem_%s.html' % display_type, data)