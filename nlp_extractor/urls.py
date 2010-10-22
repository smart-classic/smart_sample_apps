from django.conf.urls.defaults import *
from django.conf import settings

urlpatterns = patterns('',
    (r'^(?P<path>.*)$', 'django.views.static.serve', 
     {'document_root': '%s/nlp_extractor/static'%settings.APP_HOME}),
)
