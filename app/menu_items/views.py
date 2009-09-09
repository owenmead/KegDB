from app.menu_items.models import Category, MenuItem
from django.http import HttpResponse
#from django.core import serializers   -- little bit overkill
from django.utils import simplejson
from django.shortcuts import render_to_response, get_object_or_404

def index(request):
	return HttpResponse("INDEX")

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

def displayMenuItem(request, item_id, display_type):
	menu_item = get_object_or_404(MenuItem, pk=item_id)
	
	ingredients = []
	for mi in menu_item.menuingredient_set.all():
		ingredients.append({'name'           : mi.ingredient.name,
							'amount_imperial': mi.amount_imperial,
							'amount_metric'  : mi.amount_metric,
							})

	if display_type == 'cook':
		step_set = menu_item.menucookstep_set.all()
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

	data = {'menu_item'    : menu_item,
			'ingredients'  : ingredients,
			'steps'        : steps,
			'storage'      : storage,
			}
	
	return render_to_response('menuItem_%s.html' % display_type, data)