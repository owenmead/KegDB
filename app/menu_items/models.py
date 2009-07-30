from django.db import models

# Create your models here.
class Category(models.Model):
	name = models.CharField(max_length=200)
	
	def __unicode__(self):
		return self.name

	@classmethod
	def get_items(cls):
		return cls.objects.all()

class MenuItem(models.Model):
	name = models.CharField(max_length=200)
	quality_check = models.CharField(max_length=1000)

	prep_yield = models.CharField(max_length=50)
	shelf_life = models.CharField(max_length=50)

	category = models.ForeignKey(Category)

	def __unicode__(self):
		return self.name

	@classmethod
	def get_items(cls):
		return cls.objects.all().order_by('name')

class Ingredient(models.Model):
	name = models.CharField(max_length=200)

	menuItems = models.ManyToManyField(MenuItem, through="MenuIngredient")

	def __unicode__(self):
		return self.name

class MenuIngredient(models.Model):
	menuItem = models.ForeignKey(MenuItem)
	ingredient = models.ForeignKey(Ingredient)

	# The measurements stored can be pretty messed up, so keep em as text
	amount_imperial = models.CharField(max_length=50)
	amount_metric = models.CharField(max_length=50)
