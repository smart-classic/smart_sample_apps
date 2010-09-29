
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
load('dist/html.js');
load('dist/timer.js');
load('dist/parser.js');
load('dist/xhr.js');
load('local_settings.js');
load('specs/xhr/spec.js');

start();
Envjs.wait();
