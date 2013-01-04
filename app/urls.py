from django.conf.urls.defaults import *
from django.conf import settings

# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('app.menu_items.views',
	(r'^$',          'index'),

	(r'^category/$', 'categoryList'),

	(r'^menuitem/$',                   'menuitemList'),
	(r'^menuitem/byCategory/(\d+)/$',  'menuitemList'),
	(r'^menuitem/(\d+)/(prep|cook)/',  'displayMenuItem'),
	(r'^menuitem/(\d+)/allergy/',      'displayAllergy')
)

urlpatterns += patterns('',
	# Uncomment the next line to enable the admin:
	(r'^admin/', include(admin.site.urls)),

	# Used as a temp web server DO NOT USE IN PRODUCTION
	# THIS WILL ALSO GRAB ANY URL NOT SPECIFIED ABOVE
	(r'^site_media/(?P<path>.*)$', 'django.views.static.serve',
	        {'document_root': settings.STATIC_DOC_ROOT}),

	# Uncomment the admin/doc line below and add 'django.contrib.admindocs'
	# to INSTALLED_APPS to enable admin documentation:
	# (r'^admin/doc/', include('django.contrib.admindocs.urls')),
)
