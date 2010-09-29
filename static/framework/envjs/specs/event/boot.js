
/**
 * @author thatcher
 */

load('specs/qunit.js');
load('specs/env.qunit.js');
QUnit.init();

load('dist/platform/core.js');
load('dist/platform/rhino.js');
load('dist/console.js');
load('dist/dom.js');
load('dist/event.js');
load('specs/event/spec.js');
start();

