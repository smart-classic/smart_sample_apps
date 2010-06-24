from django.conf.urls.defaults import *

urlpatterns = patterns('',
    # static
    ## WARNING NOT FOR PRODUCTION
    (r'^(?P<path>.*)$', 'django.views.static.serve', {'document_root': '/home/jmandel/Desktop/smart/smart_sample_app/static/'})
)
