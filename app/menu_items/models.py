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

	category = models.ForeignKey(Category)

	def __unicode__(self):
		return self.name

	@classmethod
	def get_items(cls):
		return cls.objects.all().order_by('name')