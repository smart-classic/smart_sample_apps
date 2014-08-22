'''Settings for the SMART API Verifier'''

# The absolute path of the SMART API Verifier deployment
APP_PATH = "/web/smart-1.0/smart_sample_apps/api_verify"

# SMART Container OAuth Endpoint Configuration
ENDPOINT = {
    "url": "http://sandbox-api.smartplatforms.org/",
    "name": "Localhost",
    "app_id": "api-verifier@apps.smartplatforms.org",
    "consumer_key": "api-verifier@apps.smartplatforms.org",
    "consumer_secret": "smartapp-secret"
}

# The local copy of the SMART ontology to be used by the app
ONTOLOGY_PATH = APP_PATH + "/smart_client/common/schema/smart.owl"

# The base for the data model documentation
DOC_BASE = "http://docs-v06.smartplatforms.org/framework/models/#"
