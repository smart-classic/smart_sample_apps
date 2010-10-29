from django.http import HttpResponse
from django.conf.urls.defaults import *
from django.conf import settings

def echo_file(request):
    ret = "\n"
    for fname, fval in request.FILES.iteritems():
        for chunk in fval.chunks():
            ret += chunk
    f = request.FILES['bb_upload']
    return HttpResponse(ret, mimetype="text/plain")

urlpatterns = patterns('',
    # static
    (r'^surescripts_connector/', include('smart_sample_apps.surescripts_connector.urls')),
    (r'^nlp_extractor/', include('smart_sample_apps.nlp_extractor.urls')),
    (r'^webhook/', include('smart_sample_apps.webhook.urls')),
    (r'^echo_file$', echo_file),
    (r'^(?P<path>.*)$', 'django.views.static.serve', {'document_root': '%s/static/'%settings.APP_HOME})
)