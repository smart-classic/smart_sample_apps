from django.conf.urls.defaults import *
from django.conf import settings
urlpatterns = patterns('',
    # static
    ## WARNING NOT FOR PRODUCTION
    (r'^(?P<path>.*)$', 'django.views.static.serve', {'document_root': '%s/static/'%settings.APP_HOME})
)
