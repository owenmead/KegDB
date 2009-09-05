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

def displayMenuItem(request, item_id):
	menu_item = get_object_or_404(MenuItem, pk=item_id)
	
	ingredients = []
	for mi in menu_item.menuingredient_set.all():
		ingredients.append({'name'           : mi.ingredient.name,
							'amount_imperial': mi.amount_imperial,
							'amount_metric'  : mi.amount_metric,
							})

	steps = []
	for step in menu_item.menuprepstep_set.all():
		steps.append({'order' : step.order,
					  'step'  : step.step,
					  'isNote': step.isNote})

	storage = []
	for store in menu_item.menustoragestep_set.all():
		storage.append({'order' : step.order,
						'step'  : step.step,
						'isNote': step.isNote})

	data = {'name'         : menu_item.name,
			'quality_check': menu_item.quality_check,
			'prep_yield'   : menu_item.prep_yield,
			'shelf_life'   : menu_item.shelf_life,
			'ingredients'  : ingredients,
			'steps'        : steps,
			'storage'      : storage,
			}
	
	return render_to_response('displayMenuItem.html', data)