
/**
 * @author thatcher
 */

load('test/specs/qunit.js');
load('test/specs/env.qunit.js');
QUnit.init();

load('dist/platform/core.js');
load('dist/platform/rhino.js');
load('dist/console.js');
load('dist/timer.js');
load('test/specs/timer/spec.js');

start();
Envjs.wait();