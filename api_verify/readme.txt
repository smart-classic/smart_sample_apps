API Verifier 0.6
Nikolai Schwertner,  CHIP
-------------------------

# Overview

This package includes the SMART API Verifier app which can be used
to test the data output of a SMART container for compliance with
the SMART specifications.

The app executes a series of custom and automatically-generated (based
on the official SMART ontology) tests on the results of the container's
API calls (within the context of a patient). It will automatically fetch
data from the common medical record call of the container (this version
does not handle individual record item calls and various container-level
calls) via both the SMART Connect and SMART REST interfaces.

The results of the tests are reported in a table:

   - A green checkmark indicates that the container returned data as
result of the call and the data passed successfully all the tests within
the API Verifier.
   - A gray N/A icon indicates that the container returned an empty data
set for the call. Since not all patients have data for all the medical
record items, this is a common outcome.
   - A red cross-mark icon indicates that the API call failed. This could
mean that the call is not yet implemented in the container, the user does
not have permission to execute the call, or there was a general failure
in the system.
   - A yellow warning icon indicates that the data returned by the container
failed some of the API Verifier test. Hovering over the icon displays the
list of tests that failed. A console box beneath the results table provides
additional details about the test that failed and references to the SMART
documentation related to the problems.

The "Custom" tab provides means for manually entering data fragments and
testing them without he API Verifier for conformity to a specific data
model.

The "Queries" tab lists the details of the automatically-generated ontology
tests that the API Verifier runs against the data models. (There are other
tests included in the verifier that are not documented in this view.)

# How to use the API Verifier

While passing the API Verifier's tests does provide a high level of conformity
assurance to the container developer, it does not guarantee the validity of the
data. There are certain data problems which the current version of the verifier
is unable to detect. Therefore this app should be used as an advising tool
and not as proof for SMART conformity. We recommend running the API Verifier over
a variety of patient records within the container to test a variety of patient
data records and interfaces.

# Installing the Application

You can run the app inside the reference container by running it
locally on port 8000. You'll need the following python packages:
web.py, rdflib, rdflibextras, pyparsing, and dateutil.

To get started on ubuntu, you can
  sudo apt-get install python-webpy python-setuptools python-pyparsing python-dateutil python-httplib2
  sudo easy_install -U "rdflib>=3.0.0" rdfextras

Now, obtain the app code:
  git clone https://github.com/chb/smart_sample_apps
  cd smart_sample_apps
  git submodule init
  git submodule update
  cd api_verify

Note (for Windows users): You will need to set up manually the
following symlinks from an admin-privileged command prompt:
  mklink /d smart_client ..\smart_client
  mklink /d static\smart ..\..\static\framework\smart\scripts
  
Before launching the apps, you should copy "settings.py.default"
into "settings.py" and edit the APP_PATH value. Now you can launch
the apps server:

  PYTHONPATH=.:.. && python main.py 8000

The app provides a manifest that can be used for registering the
app with a SMART container at this address (assuming that you are
running and accessing the app locally):

  http://localhost:8000/static/smart_manifest.json

Once you have installed the manifest into the container, replace the
consumer_secret in the main.py file with the one returned by the
container.
