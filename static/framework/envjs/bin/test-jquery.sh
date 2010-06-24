#!/bin/sh

###########################################################################
# Usage: test-jquery.sh <debug?> [version]
# Currently supported versions: 1.4.2, 1.4.1, 1.3.2
#
# This script will check out the jQuery development tree from Subversion 
# or github if necessary and then run the test scripts.
###########################################################################
LATEST="1.4.2"

if [ -n "$2" ]; then 
    echo 'debug mode'
    if [ -n "$2" ]; then VERSION="$2"; else VERSION=$LATEST; fi
    DEBUG=1
else 
    if [ -n "$1" ]; then VERSION="$1"; else VERSION=$LATEST; fi
    DEBUG=0
fi

echo $VERSION
SVN=http://jqueryjs.googlecode.com/svn/tags/$VERSION/
GIT=http://github.com/jquery/jquery.git

JQUERY_DIR=test/vendor/jQuery/$VERSION
echo vendor: $JQUERY_DIR

###########################################################################
#
#   Get the source
#
###########################################################################
case "$VERSION" in

    "1.2.6")
        echo "1.2.6 tests are currently known to be broken with envjs 1.2 ..." 
        #currently broken - the archivist in me doesnt want to let 
        #jquery 1.2.6 go untested - coming soon 
        if [ ! -d "$JQUERY_DIR" ]; then
            svn export  $SVN $JQUERY_DIR
            cd $JQUERY_DIR
            make
            cd -
        fi
        ;;
    "1.3.1"|"1.3.2")
        if [ ! -d "$JQUERY_DIR" ]; then
            svn export $SVN $JQUERY_DIR
            cd $JQUERY_DIR
            make
            cd -
        fi
        ;;
   "1.4.1"|"1.4.2")
        if [ ! -d $JQUERY_DIR ]; then
            echo 'cloning jquery '$VERSION' repo '$GIT $JQUERY_DIR
            git clone $GIT $JQUERY_DIR
            if [ ! -d $JQUERY_DIR ]; then
                echo 'FAILED to clone from git. \n' $GIT
                exit
            fi
            cd $JQUERY_DIR
            git branch jquery-$VERSION $VERSION
            git checkout jquery-$VERSION
            make
            cd -
        fi
        ;;
esac

###########################################################################
#
#   Run the tests
#
###########################################################################
echo 'running jquery '$VERSION' tests'
if [ $DEBUG -eq 1 ]; then
    echo 'enabling rhino debugger'
    java  -cp rhino/js.jar  \
        org.mozilla.javascript.tools.shell.Main \
        bin/test-jquery.js $VERSION $3 $4 $5 $6 $7 $8 $9
else
    #echo 'running with rhino'
    #if you experience out of memory errors try add these after java
    #-Xmx64M \ 
    #-XX:+HeapDumpOnOutOfMemoryError \  
    java \
        -cp rhino/js.jar \
        org.mozilla.javascript.tools.shell.Main \
        -opt -1 \
        bin/test-jquery.js  $VERSION $2 $3 $4 $5 $6 $7 $8 $9
fi
echo 'completed jquery' $VERSION 'tests'
