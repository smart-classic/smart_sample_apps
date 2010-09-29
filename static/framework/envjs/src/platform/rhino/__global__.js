/*
 * Envjs @VERSION@
 * Pure JavaScript Browser Environment
 * By John Resig <http://ejohn.org/> and the Envjs Team
 * Copyright 2008-2010 John Resig, under the MIT License
 */

//Make these global to avoid namespace pollution in tests.
/*var __context__ = Packages.org.mozilla.javascript.Context.getCurrentContext();*/
__context__ = Packages.org.mozilla.javascript.Context.getCurrentContext();

Envjs.platform       = "Rhino";
Envjs.revision       = "1.7.0.rc2";
