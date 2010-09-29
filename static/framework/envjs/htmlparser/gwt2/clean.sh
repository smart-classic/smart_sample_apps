#!/bin/sh

echo "Cleaning up non-git files"
rm -rf gwt-*
rm -rf htmlparser-*
rm -rf war

find . -name '*~' | xargs rm -f
find . -name '*.class' | xargs rm -f


