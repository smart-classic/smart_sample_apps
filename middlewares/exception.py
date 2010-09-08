"""
Middleware (filters) error handling
"""

class ExceptionMiddleware(object):
  def process_exception(self, request, exception):
    import sys, traceback
    print >> sys.stderr, exception, dir(exception)
    traceback.print_exc(file=sys.stderr)    
    sys.stderr.flush()
