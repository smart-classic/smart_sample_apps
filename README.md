SMART Sample Apps

This repository contains a collection of sample SMART Connect Apps and SMART REST Apps.
The entire collection of sample apps is packaged here as a django app,
because that's how we deploy it on our development servers.  All the
javascript/html code resides in /static.

Most of these apps were built using the JavascriptMVC framework.
There's a shared library of data models and common code in
static/framework/smart, and individual application code resides in
subdirectories of static/framework
(e.g. static/framework/problem_list).For installation instructions, please see the README at:

  https://github.com/smart-platforms/smart_server/
