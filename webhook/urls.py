from django.http import HttpResponse
from django.conf.urls.defaults import *
from django.conf import settings
from fuzzy_match import fuzzy_match_request, confident_match_request
from extract_meds import extract_meds
from check_allergies import check_allergies

urlpatterns = patterns('',
    # static
    (r'^fuzzy_match_rxnorm$', fuzzy_match_request),
    (r'^confident_match_rxnorm$', confident_match_request),
    (r'^extract_meds_from_plaintext$', extract_meds),
    (r'^check_allergies$', check_allergies)
)
