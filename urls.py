from django.http import HttpResponse
from django.conf.urls.defaults import *
from django.conf import settings
from fuzzy_match import fuzzy_match_request

def echo_file(request):
    ret = "\n"
    for fname, fval in request.FILES.iteritems():
        for chunk in fval.chunks():
            ret += chunk
            
    
    f = request.FILES['bb_upload']
    return HttpResponse(ret, mimetype="text/plain")

urlpatterns = patterns('',
    # static
    ## WARNING NOT FOR PRODUCTION
    (r'^echo_file$', echo_file),
    (r'^intent/fuzzy_match_rxnorm$', fuzzy_match_request),
    (r'^(?P<path>.*)$', 'django.views.static.serve', {'document_root': '%s/static/'%settings.APP_HOME})
)
