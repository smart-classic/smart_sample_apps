from django.conf.urls.defaults import *
from django.conf import settings

urlpatterns = patterns('',
    (r'^(?P<path>.*)$', 'django.views.static.serve', 
     {'document_root': '%s/lab_result_alerts/static'%settings.APP_HOME}),
)
