from app.menu_items.models import Category
from django.http import HttpResponse

def index(request):
	cats = Category.objects.all()
	output = ", ".join([c.name for c in cats])
	return HttpResponse(output)