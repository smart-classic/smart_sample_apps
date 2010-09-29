

deaccessor.py < IN > OUT
----------------------------------
Used by 'ant jslint'
Is a hack to change getters and setters into normal functions so jslint can handle it
Could be written in javascript to remove dependency on python.

Used in 'ant jslint'

jslint.js
----------------------------------
The rhino version of jslint.org

Used in 'ant jslint'

jsmin.js
----------------------------------
originally from http://www.crockford.com/javascript/jsmin.html
It doesn't do that great of a job in compression since it's very non-aggressive, but also doesn't
break the javascript.  Typically a good 20-30% reduction in size.

This very has a rhino wrapper built-in, so to use

java -jar js.jar jsmin.js FILE > OUT


$ java -jar rhino/js.jar misc/jsmin.js dist/env.js > dist/env.min.js
$ ls -lh dist/env.js dist/env.min.js
-rw-r--r--  1 nickg  staff   638K Mar 31 21:57 dist/env.js
-rw-r--r--  1 nickg  staff   446K Mar 31 23:46 dist/env.min.js

not so bad... saved 200k

as we get the code base in better shape, it is expected we can use more aggressive minifiers.

