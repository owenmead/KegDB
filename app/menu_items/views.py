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
	if category_id:
		search = dict(category=category_id)
	else:
		search = {}

	menu_items = []
	for item in MenuItem.get_items().filter(**search):
		menu_items.append({'id': item.id, 'name': item.name, 'categoryID': item.category.id})
	return HttpResponse(simplejson.dumps(menu_items))

def displayAllergy(request, item_id):
	menu_item = get_object_or_404(MenuItem, pk=item_id)
	allergens = Allergen.objects.filter(ingredients__menuItems__id=item_id).distinct()
	data = {'menu_item' : menu_item, 'allergens' : allergens }
	return render_to_response('menuItem_allergy.html', data)

def displayMenuItem(request, item_id, display_type):
	menu_item = get_object_or_404(MenuItem, pk=item_id)
	
	if display_type == 'prep':
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
					  'isNote'    : step.isNote})

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

	if display_type == 'prep' and menu_item.item_type == MenuItem.TYPE_COOKONLY:
		display_type = 'cookONLY'

	return render_to_response('menuItem_%s.html' % display_type, data)