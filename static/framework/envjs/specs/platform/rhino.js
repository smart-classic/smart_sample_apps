load('specs/qunit.js');
load('specs/env.qunit.js');
QUnit.init();

load('dist/platform/core.js');
load('dist/platform/rhino.js');
load('dist/console.js');
load('src/common/__extend__.js');
load('settings.js');

module('platform-rhino');

test('Envjs Platform Interfaces Available', function(){

    ok(Envjs,                                       'Envjs defined');
    ok(Envjs.log.toString() !== 'function(){};',    'Envjs.log defined');
    ok(Envjs.proxy.toString() !== 'function(){};',  'Envjs.proxy defined');

});


//Foo is a minimal window implementation
var Foo =  function(scope, parent){
    var $proxy = new Envjs.proxy(scope, parent),
    $parent = parent;
    scope.__proxy__ = $proxy;
    return __extend__(scope,{
        get parent(){
            return parent;
        },
        get top(){
            var _parent = $parent;
            while(scope && _parent && scope !== _parent){
                if(_parent === _parent.parent)break;
                _parent = _parent.parent;
            }
            return _parent || null;
        },
        get abcdefghi(){
            return $proxy;
        }
    });
};

var _this = this;

test('Envjs.proxy', function(){

    var frame = {},
    subframe = {};

    new Foo(_this, _this);
    equals(abcdefghi.parent, abcdefghi, '.parent');
    equals(abcdefghi.top, abcdefghi, '.top');

    new Foo(frame, abcdefghi);
    equals(frame.parent, abcdefghi, '.parent');

    new Foo(subframe, frame);
    equals(subframe.parent, frame, '.parent');
    equals(subframe.parent.parent, abcdefghi, '.parent.parent');
    equals(subframe.top, abcdefghi, '.top');


});


Envjs.onExit(function(){
    console.log('onExit!');
});


start();