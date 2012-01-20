SMART Direct Applications
Nikolai Schwertner,  CHIP
-------------------------

# Getting Started
This package includes two SMART Applications which send patient
data from a SMART container via Direct.

You can run the app inside the reference container by running it
locally on port 8000. You'll need the following python packages:
web.py, reportlab, rdflib, rdflibextras, and pyparsing.

To get started on ubuntu, you can
  sudo apt-get install python-webpy python-pyparsing python-setuptools python-reportlab
  sudo easy_install -U "rdflib>=3.0.0" rdfextras

Now, obtain the app code:
  git clone https://github.com/chb/smart_sample_apps
  cd smart_sample_apps/direct_apps

Note (for Windows users): You will need to set up manually the
following symlinks from an admin-privileged command prompt:
  mklink /d smart_client ..\smart_client
  mklink /d static\smart ..\..\static\framework\smart\scripts 
  
Before launching the apps, you should copy "settings.py.default"
into "settings.py" and edit the APP_PATH value as well as the
Direct servers' settings. Now you can launch the apps server:

  PYTHONPATH=.:.. && python main.py 8000

Then log in to the reference container at:
 http://sandbox.smartplatforms.org

Launch the "My App" app, which will point at your locally
hosted version of SMART Direct Apps.

NOTE: This app needs python 2.7 or higher.

# Poller

On the server hosting the SMART Proxy container, you should run
the SMART Direct message poller service (python.py). Again, first
make sure that you have edited "settings.py". Also, you may have
to edit "import-patient" if you SMART reference container is at
a different location than ours. To run the poller, you can use
the following command:

  python poller.py

or alternatively, if you want to run it as a stand-alone service:

  nohup python poller.py &
