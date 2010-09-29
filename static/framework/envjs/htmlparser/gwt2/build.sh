#!/bin/sh

#
# Autodownload Parser
#  from mozilla HG.
# TODO: use specific releases
#
PARSER=htmlparser

#
# Use mozilla trunk
#
echo "HG update from http://hg.mozilla.org/projects/htmlparser"
if [ ! -d "${PARSER}" ]; then
    hg clone http://hg.mozilla.org/projects/htmlparser
else
    (cd "${PARSER}"; hg pull; hg update )
fi
echo "----"

echo "Installing GWT"

#
# Autodownload GWT
#
#
GWT=gwt-2.0.3
GWT_ZIP="${GWT}.zip"

if [ ! -d "${GWT}" ]; then
    wget "http://google-web-toolkit.googlecode.com/files/${GWT_ZIP}"
    unzip ${GWT_ZIP}
fi
echo "----"

CP="./src:./${PARSER}/src:./${PARSER}/super:./${GWT}/gwt-user.jar:./${GWT}/gwt-dev.jar"

# Compile a new GWT linker.  Very simple to Single Script Linker but
# removes all the "bootstrap" and client (real browser) onScriptLoad
# events, etc.
echo "Javac our linker"
javac -cp ${CP} src/com/envjs/gwt/linker/ServerSingleScriptLinker.java

echo "Starting GWT..."
java \
    -Xmx256M \
    -cp "${CP}" \
    com.google.gwt.dev.Compiler \
    -logLevel ERROR \
    -style PRETTY \
    nu.validator.htmlparser.HtmlParser;

#    -draftCompile \
echo "----"
echo "COPY to envjs src tree"
cp war/nu.validator.htmlparser.HtmlParser/nu.validator.htmlparser.HtmlParser.nocache.js ../../src/parser/htmlparser.js

#
# On innerhtml and some document-writes,some problems occurs when the
# parser being invoked with the wrong state.  This patch just prevents
# the parser from dying and throwing an exception.
#
echo "PATCHING"
patch ../../src/parser/htmlparser.js patch1.diff
echo "DONE"

