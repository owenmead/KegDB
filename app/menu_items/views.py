from app.menu_items.models import Category, MenuItem
from django.http import HttpResponse
from django.core import serializers

def index(request):
	return HttpResponse("INDEX")

def categoryList(request):
	data = serializers.serialize("json", Category.objects.all(), ensure_ascii=False)
	return HttpResponse(data)

def menuitemList(request):
	data = serializers.serialize("json", MenuItem.objects.all(), ensure_ascii=False)
	return HttpResponse(data)