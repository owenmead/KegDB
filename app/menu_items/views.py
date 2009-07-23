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

def menuitemList(request):
	menu_items = []
	for item in MenuItem.get_items():
		menu_items.append({'id': item.id, 'name': item.name, 'categoryID': item.category.id})
	return HttpResponse(simplejson.dumps(menu_items))

def displayMenuItem(request, item_id):
	menu_item = get_object_or_404(MenuItem, pk=item_id)
	
	data = {'name': menu_item.name, 'quality_check': menu_item.quality_check}
	
	return render_to_response('displayMenuItem.html', data)