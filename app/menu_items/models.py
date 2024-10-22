from django.db import models

# Create your models here.
class Category(models.Model):
	name = models.CharField(max_length=200)

	def __unicode__(self):
		return self.name

	class Meta:
		ordering = ['name']

	@classmethod
	def get_items(cls):
		return cls.objects.all()

class MenuItem(models.Model):
	name = models.CharField(max_length=200)
	quality_check_prep = models.TextField(blank=True)
	quality_check_cook = models.TextField(blank=True)

	prep_yield = models.CharField(max_length=50, default="1 portion")
	cook_yield = models.CharField(max_length=50, default="1 serving")
	shelf_life = models.CharField(max_length=50, blank=True)

	photo = models.ImageField(upload_to="menuPhoto", blank=True)

	category = models.ForeignKey(Category)

	is_active = models.BooleanField(default=True)

	def __unicode__(self):
		return self.name

	class Meta:
		ordering = ['name']

	TYPE_REGULAR  = 'R'
	TYPE_COOKONLY = 'C'
	TYPE_PREPONLY = 'P'
	def get_type(self):
		# Infered by ingredient list. If no prep ingredients, then cook only for example.
		if self.menuingredient_set.filter(ingredient_type='C').count() == 0:
			return self.TYPE_PREPONLY
		elif self.menuingredient_set.filter(ingredient_type='P').count() == 0:
			return self.TYPE_COOKONLY
		else:
			return self.TYPE_REGULAR

	@classmethod
	def get_items(cls):
		return cls.objects.all().order_by('name')

class MenuItemAbstractStep(models.Model):
	order = models.PositiveIntegerField()
	step = models.TextField(blank=True)
	isNote = models.BooleanField(default=False)
	photo = models.ImageField(upload_to="menuPhoto", blank=True)

	menu = models.ForeignKey(MenuItem)

	class Meta:
		abstract = True
		ordering = ['order']

	def __unicode__(self):
		return u'[%d]%s' % (self.order, self.step)

class MenuStorageStep(MenuItemAbstractStep):
	pass

class MenuPrepStep(MenuItemAbstractStep):
	pass

class MenuCookStep(MenuItemAbstractStep):
	pass

class MenuPresentationStep(MenuItemAbstractStep):
	pass

class Ingredient(models.Model):
	name = models.CharField(max_length=200)

	menuItems = models.ManyToManyField(MenuItem, through="MenuIngredient")

	prep_item_link = models.ForeignKey(MenuItem, related_name="prepIngredients", null=True, blank=True)

	def __unicode__(self):
		return self.name

	class Meta:
		ordering = ['name']


class MenuIngredient(models.Model):
	menuItem = models.ForeignKey(MenuItem)
	ingredient = models.ForeignKey(Ingredient)

	# The measurements stored can be pretty messed up, so keep em as text
	amount_imperial = models.CharField(max_length=50)
	amount_metric = models.CharField(max_length=50)

	TYPE_CHOICES = (('C', 'Cook'), ('P', 'Prep'))
	ingredient_type = models.CharField(max_length=1, choices=TYPE_CHOICES)

	def __unicode__(self):
		return "%s >> %s/%s << %s" % (self.menuItem.name, self.amount_imperial, self.amount_metric, self.ingredient.name)

class Allergen(models.Model):
	name = models.CharField(max_length=200)

	ingredients = models.ManyToManyField(Ingredient, blank=True)

	def __unicode__(self):
		return self.name

	class Meta:
		ordering = ['name']

class Flatware(models.Model):
	name = models.CharField(max_length=200)

	menuItems = models.ManyToManyField(MenuItem, blank=True)

	def __unicode__(self):
		return self.name

	class Meta:
		ordering = ['name']
