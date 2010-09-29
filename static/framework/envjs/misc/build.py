#!/usr/bin/env python

#
# Fast "concatenator" for envjs.
# scans the ant build.xml file to find
#  source files and glues then together
#
#
import re
import sys
import os.path

def getfilenames(base, platform):
    target = re.compile('target name="([^"]+)"')
    fileset = re.compile('fileset.*SRC_DIR.*includes="([^"]+)"')

    # only support rhino right now
    buildrhino = (platform == 'rhino')

    files = []
    isrhino = False
    f = open(os.path.join(base, 'build.xml'))
    for line in f:

        # mini-sax... if we see a <target ...>
        #  check that it is not rhino stuff
        #  if so, we'll skip al the filesets
        mo = target.search(line)
        if mo:
            fname = mo.group(1)
            isrhino = (fname == 'rhino-env')
        mo = fileset.search(line)
        if mo and (buildrhino or not isrhino):
            fname = mo.group(1)
            files.append(fname)
    f.close()
    return files

def concat(base, src, outfile, atline=True, platform=None):
    files = getfilenames(base, platform)
    outfile = open(outfile, 'w')
    for f in files:
        fname = os.path.join(base, src, f)
        data = open(fname, 'r')
        if atline:
            if  f != 'common/outro.js' and f != 'common/intro.js':
                outfile.write('\n//@line 1 "' + f + '"\n')
                outfile.write(data.read())
        else:
            outfile.write(data.read())
        data.close()

if __name__ == '__main__':
    from optparse import OptionParser

    parser = OptionParser()
    parser.add_option('-t', '--top', dest='top', default='.',
                      help="Location of env-js source tree")
    parser.add_option('-s', '--src', dest='src', default='src',
                      help="Source directory, default is 'src'")
    parser.add_option('-d', '--dist', dest='dist', default='dist',
                      help="Destination directory, default 'dist'")
    parser.add_option('-p', '--platform', dest='platform', default='',
                      help="platform type, optional. Defaults to core platform. 'rhino' is the only value supported")
    parser.add_option('-a', '--atline', dest='atline', action="store_true",
                      default=False,
                      help="platform type, optional. Defaults to core platform. 'rhino' is the only value supported")
    (options, args) = parser.parse_args()

    outname = 'env.js'
    if options.platform == 'rhino':
        outname = 'env.rhino.js'

    outfile = os.path.join(options.top, options.dist, outname)
    concat(os.path.expanduser(options.top),
           os.path.expanduser(options.src),
           os.path.expanduser(outfile),
           atline=options.atline,
           platform=options.platform)

