from django.conf.urls.defaults import *
from django.conf import settings

# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
	(r'^$',          'app.menu_items.views.index'),
	(r'^category/$', 'app.menu_items.views.categoryList'),

	(r'^menuitem/$',  'app.menu_items.views.menuitemList'),
	(r'^menuitem/byCategory/(\d+)/$',  'app.menu_items.views.menuitemList'),
	(r'^menuitem/(\d+)/',  'app.menu_items.views.displayMenuItem'),


	# Uncomment the admin/doc line below and add 'django.contrib.admindocs' 
	# to INSTALLED_APPS to enable admin documentation:
	# (r'^admin/doc/', include('django.contrib.admindocs.urls')),

	# Uncomment the next line to enable the admin:
	(r'^admin/', include(admin.site.urls)),
	
	# Used as a temp web server DO NOT USE IN PRODUCTION
	# THIS WILL ALSO GRAB ANY URL NOT SPECIFIED ABOVE
	(r'^(?P<path>.*)$', 'django.views.static.serve',
	        {'document_root': settings.STATIC_DOC_ROOT}),

)
