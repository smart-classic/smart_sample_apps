#!/usr/bin/env python
#
# deaccessor.py
# http://blog.client9.com/2010/03/using-jslint-with-javascript-getters.html
# Copyright 2010 Nick Galbreath
# MIT License
# http://www.opensource.org/licenses/mit-license.php
#
# Converts javascript getters/setters to traditional function format.
# This allows static analysis tools such as jslint to still run.  Also
# has minimal checking to make sure getters do not have an arg and
# that setters have only 1 arg.
#
# specifically:
#  get NAME() {  ----> get_NAME: function () {
#  set NAME(arg) { ----> set_NAME: function (ARG) {
#
# usage:
#   ./deaccessor.py < INFILE > OUTFILE
#
# then with jslint http://www.JSLint.com/rhino/jslint.js
#  java -jar js.jar jslint.js OUTFILE
#
#
import re
import sys

write = sys.stdout.write
error = sys.stderr.write

getsetre = re.compile('\s+(get|set)\s+(\w+)\s*\\(([^)]*)\\)')

# put whatever you want as preamble
write("""/*jslint browser: false,
   evil: true,
   nomen: false,
   regexp: false,
   plusplus: false,
   rhino: true,
   white: false,
   onevar: false,
   eqeqeq: false,
   bitwise: false,
   maxerr: 100000,
   es5: false
*/
/*global console: true, window:true, document:true, XML: true, XMLList: true */
""")
count = 0
for line in sys.stdin:
    count += 1
    mo = getsetre.search(line)
    if mo:
        if mo.group(1) == 'get':
            if len(mo.group(3).strip()) > 0:
                error("WARNING: line %d: Getter has argument: %s\n" % (count, line.strip()))
        elif mo.group(1) == 'set':
            if len(mo.group(3).strip().split(',')) > 1:
                error("WARNING: line %d: Setter has more than one arg: %s\n" % (count, line.strip()))

        write("%s%s_%s: function (%s)%s" %
              (line[0:mo.start(1)], # before def
               mo.group(1),         # get or set
               mo.group(2),         # function name
               mo.group(3),         # arg list
               line[mo.end(3)+1:])  # after arglist ending ')'
              )
    else:
        write(line)
