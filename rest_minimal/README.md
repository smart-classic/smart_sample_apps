
# The (Minimal) Python Flask SMART REST App

Arjun Sanyal & Pascal Pfiffner, Harvard Medical School

For complete documentation on SMART REST including a tutorial using this
app see the complete SMART documentation at <http://docs.smartplatforms.org>

---

This is our simple example app to demonstrate using the SMART Python
client to make REST API calls and the OAuth "dance" used by SMART for
authentication and authorization. It would be the ideal base for your
Python-based SMART REST apps. It's based on the excelent [Flask][] web
microframework.


## Setup

### Requirements

The Python modules you will need are:

- Flask 0.9+
- Jinja 2.4+
- Werkzeug 0.7+

We like <http://www.pip-installer.org/> to install these:

    $ [sudo] pip install flask


### Configuration

The `wsgi.py` script is set up to work against the SMART Sandbox
reference EHR out of the box, but if you would like to work against
another container change the _ENDPOINT settings at the top of the script
to your preferred SMART container (including the `consumer_secret`). You
must then edit and install the sample `manifest.json` file into it.


## Running

Start the app listening on <http://localhost:8000> is simply:

    $ python wsgi.py


## Learn More

The details of the [OAuth][] dance used by SMART REST apps is described
on our [documentation site][]. See also the documentation for the
[Flask][] Python web microframework as well.

[oauth]: http://dev.smartplatforms.org/howto/build_a_rest_app/
[documentation site]: http://dev.smartplatforms.org
[flask]: http://flask.pocoo.org
