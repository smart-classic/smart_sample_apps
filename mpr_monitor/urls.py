"""
    File: urls.py
    
    Author: William J. Bosl
    Children's Hospital Boston
    300 Longwood Avenue
    Boston, MA 02115
    Email: william.bosl@childrens.harvard.edu
    Web: http://chip.org

    Copyright (C) 2011 William Bosl, Children's Hospital Boston Informatics Program (CHIP)
    http://chip.org. 

    Purpose:
    
    This file is part of a Django-based SMArt application that implements
    a two-step test for medication adherence. It is intended to be used as
    a SMArt web application within the context of a SMArt container. See
    http://www.smartplatforms.org/ for detailed information about SMArt applications.
        
    License information should go here.

    $Log: urls.py,v $
"""

from django.conf.urls.defaults import patterns
from MedCheck.views import index, risk, about, choose_med
import settings

# A typical urlconf entry looks like this:
#(r'<regex>', <view_function>, <arg_dict>),


# Uncomment the next two lines to enable the admin:
# from django.contrib import admin
# admin.autodiscover()

urlpatterns = patterns('',
    (r'^smartapp/index.html$', index),
    #(r'^smartapp/bootstrap.html$', bootstrap),
    
    # List of all patients, indicating those with potential adherence issues
    (r'^smartapp/risk.html$', risk),
    (r'^smartapp/about.html$', about),
    (r'^smartapp/choose_med.html$', choose_med),
    
    # For images
    (r'^smartapp/(?P<path>.*)$', 'django.views.static.serve',{'document_root': settings.MEDIA_ROOT}),
    
    # For RDF-NT drug information
    (r'^smartapp/(?P<path>.*)$', 'django.views.static.serve',{'document_root': settings.NDF_RT}),
        
    # Examples:
    # url(r'^$', 'SMART.views.home', name='home'),
    # url(r'^SMART/', include('SMART.foo.urls')),

    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    # url(r'^admin/', include(admin.site.urls)),
)
