
/**
 * @author thatcher
 */

load('specs/qunit.js');
load('specs/env.qunit.js');
load('specs/helpers.js');
QUnit.init();

load('dist/platform/core.js');
load('dist/platform/rhino.js');
load('dist/console.js');
load('dist/dom.js');
load('dist/event.js');
load('dist/html.js');

// if the html code has forward references, then
// we have a different problem.

//load('dist/timer.js');
//load('dist/parser.js');
//load('dist/xhr.js');
//load('dist/window.js');

load('specs/html/spec.js');

location = 'specs/html/index.html';
    
start();
