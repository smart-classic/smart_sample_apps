#!/bin/sh

#svn co https://whattf.svn.cvsdude.com/htmlparser/trunk/ html5

cp BrowserTreeBuilder.java html5/gwt-src/nu/validator/htmlparser/gwt/BrowserTreeBuilder.java
cp HtmlParserModule.java html5/gwt-src/nu/validator/htmlparser/gwt/HtmlParserModule.java
cp HtmlParser.java html5/gwt-src/nu/validator/htmlparser/gwt/HtmlParser.java

#cp gwt-1.5.1/gwt-dev-*.jar gwt-1.5.1/gwt-dev.jar

APPDIR=`dirname $0`/html5/;

echo $APPDIR

###
# We need to make some fragile changes to the generated source to remove+avoid 
#   the gwt loading process.
#
# The gwt loading process is primarily centered around an initial anonymous
#   closure which we entirely remove using the non global match on 
#       (function(){.*})();
# 
# We also need to remove all references to 'window' and 'document' which are 
#   fortunately set to $wnd and $doc inside the secondary anonymous closure.
#   In order to cleanly remove them we first ensure any standard Window 
#   interfaces referenced via '$wnd.' are replaced with the global scope
#   reference.  This practically only affects references to $wnd.setTimeout
#   and $wnd.clearInterval.  After replacing the more specific $wnd references
#   we replace /var $wnd = window;/ with /var $wnd = {};/ to allow clean 
#   assignments that are functionally meaningless.  Similarly, 
#   /var $doc = $wnd.document;/ is simply removed since there appears to be no 
#   other reference to $doc throughout. 
#
# Finally we need to make the 'function gwtOnLoad' declaration referencable 
#   outside its closure so we change it to '__defineParser__ = function gwtOnload'
#   while adding a module level declaration of var __defineParser__ above the 
#   parser closure and an execution of __defineParser__(errorfn, moduleName, moduleBase)
#   below.  The 'errorfn' will be defined above the closure as well as moduleName
#   which is the value 'nu.validator.htmlparser.HtmlParser', and moduleBase which
#   is the value ''
###

###
# Min
###
#echo "Generating Minified HTMLParser"
#java -XstartOnFirstThread -Xmx256M -cp "$APPDIR/src:$APPDIR/gwt-src:$APPDIR/super:./gwt-2.0.2/gwt-user.jar:./gwt-2.0.2/gwt-dev.jar" com.google.gwt.dev.GWTCompiler -compileReport -out "build/min" "$@" nu.validator.htmlparser.HtmlParser;
#cp ./build/min/nu.*.HtmlParser/nu.*.HtmlParser.nocache.js ./build/htmlparser.js


## replaces local named function definitions with variable named assignments;
#perl -p -e "s/function (\w{2}i)/\$1 = function/g" ../src/parser/htmlparser.js

## creates variable declarations for varaibale named assignments
#perl -p -e "s/.*function (\w{2}i).*/\var \$1;/g" ../src/parser/htmlparser.js
#perl -p -e "s/([\w\\$]{2}[gh]).*,$/\$1,/g" ../src/parser/strings.js > ../src/parser/string_declarations.js

## see notes at top of file
#perl -pi~ -e "s/if\(j\.addEventListener\)(.*)50\)/\/\*envjsedit\*\//" ./build/htmlparser.js 
#perl -pi~ -e "s/if\(j\.removeEventListener\)/if\(false\/\*envjsedit\*\/\)/" ./build/htmlparser.js
#perl -pi~ -e "s/function kb\(\)/\/\*envjsedit\*\/var kb = Html5Parser = function\(\)/" ./build/htmlparser.js

###
# Pretty HTMLParser
#
#echo "Generating Pretty HTMLParser"
java -XstartOnFirstThread -Xmx256M -cp "$APPDIR/src:$APPDIR/gwt-src:$APPDIR/super:./gwt-2.0.2/gwt-user.jar:./gwt-2.0.2/gwt-dev.jar" com.google.gwt.dev.GWTCompiler -compileReport -style PRETTY -out "build/pretty" "$@" nu.validator.htmlparser.HtmlParser;
#cp ./build/pretty/nu.*.HtmlParser/nu.*.HtmlParser.nocache.js ./build/htmlparser.pretty.js

#perl -pi~ -e "s/\(function\s\{(.*)\}//" ./build/htmlparser.pretty.js 
#perl -pi~ -e "s/,\s50\);/envjsedit\*\//s" ./build/htmlparser.pretty.js 
#perl -pi~ -e "s/if(.*)\((.*)doc_0\.removeEventListener\)/if\(false\/\*envjsedit\*\/\)/" ./build/htmlparser.pretty.js
#perl -pi~ -e "s/function onBodyDone\(\)/\/\*envjsedit\*\/var onBodyDone = Html5Parser = function\(\)/" ./build/htmlparser.pretty.js
####

####
#
# Detailed HTMLParser should only be generated for 'extreme' debugging. It's
#   huge and generally less readable than Pretty
#
#echo "Generating Detailed HTMLParser"
#java -XstartOnFirstThread -Xmx256M -cp "$APPDIR/src:$APPDIR/gwt-src:$APPDIR/super:./gwt-1.5.1/gwt-user.jar:./gwt-1.5.1/gwt-dev.jar" com.google.gwt.dev.GWTCompiler -style DETAILED -out "build/detailed" "$@" nu.validator.htmlparser.HtmlParser;
#cp ./build/detailed/nu.*.HtmlParser/nu.*.HtmlParser.nocache.js ./build/html5.detailed.js
#perl -pi~ -e "s/if(.*)\((.*)doc\.addEventListener\)/\/\*envjsedit/s" ./build/html5.detailed.js 
#perl -pi~ -e "s/,\s50\);/envjsedit\*\//s" ./build/html5.detailed.js 
#perl -pi~ -e "s/if(.*)\((.*)doc\.removeEventListener\)/if\(false\/\*envjsedit\*\/\)/" ./build/html5.detailed.js
#perl -pi~ -e "s/function onBodyDone\(\)/\/\*envjsedit\*\/var onBodyDone = Html5Parser = function\(\)/" ./build/html5.detailed.js
####

#rm ./build/*.js~

#cp ./build/htmlparser*.js ../src/parser/
