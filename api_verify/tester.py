from tests import runTest, getMessages
messages = getMessages(runTest('Demographics', '<a></a>', 'application/rdf+xml'))
for m in messages:
    print m
