from django.http import HttpResponse
from django.conf.urls.defaults import *
from django.conf import settings

urlpatterns = patterns('',
    (r'^webhook/', include('smart_sample_apps.webhook.urls')),
    (r'^(?P<path>.*)$', 'django.views.static.serve', {'document_root': '%s/static/'%settings.APP_HOME})
)
