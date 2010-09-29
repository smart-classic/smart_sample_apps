QUnit.module('event');
test('Event Interfaces Available', function(){

    expect(7);
    ok(Event,              'Event defined');
    ok(UIEvent,            'UIEvent defined');
    ok(MouseEvent,         'MouseEvent defined');
    ok(KeyboardEvent,      'KeyboardEvent defined');
    ok(MutationEvent,      'MutationEvent defined');
    ok(DocumentEvent,      'DocumentEvent defined');
    ok(EventTarget,        'EventTarget defined');

});

// mock the global document object if not available
try{
    document;
}catch(e){
    console.log('mocking global document object.');
    document = new Document(new DOMImplementation());
}

test('document.createEvent("Events")', function(){

    var event = document.createEvent('Events');

    ok(event = document.createEvent('Events'), 'can create Events');
    ok(event.timeStamp > 0, '.timestamp has default value');
    equals(event.cancelable, true,'.cancelable has expected default value');
    equals(event.bubbles, true,'.bubbles has expected default value');
    equals(event.eventPhase, Event.AT_TARGET,'.eventPhase has expected default value');
    equals(event.currentTarget, null,'.currentTarget has expected default value');
    equals(event.target, null,'.target has expected default value');
    // its interesting to note you can't access event.type
    // before calling initEvent or firefox will throw an error

    event.initEvent(null, false, false);
    equals(event.type, '','.type has expected value');
    equals(event.cancelable, false,'.cancelable has expected value');
    equals(event.bubbles, false,'.bubbles has expected value');

    event.initEvent('ABC', true, true);
    equals(event.type, 'ABC','.type is mutable via initEvent');
    equals(event.cancelable, true,'.cancelable is mutable via initEvent');
    equals(event.bubbles, true,'.bubbles is mutable via initEvent');

    event.initEvent('ENVJS', null, null);
    equals(event.type, 'ENVJS','.type has expected value');
    equals(event.cancelable, false,'.cancelable has expected value');
    equals(event.bubbles, false,'.bubbles has expected value');


});

test('document.createEvent("HTMLEvents")', function(){

    var event;

    ok(event = document.createEvent('HTMLEvents'), 'can create HTMLEvents');
    ok(event.timeStamp > 0, '.timestamp has default value');
    equals(event.cancelable, true,'.cancelable has expected default value');
    equals(event.bubbles, true,'.bubbles has expected default value');
    equals(event.eventPhase, Event.AT_TARGET,'.eventPhase has expected default value');
    equals(event.currentTarget, null,'.currentTarget has expected default value');
    equals(event.target, null,'.target has expected default value');
    // its interesting to note you can't access event.type
    // before calling initEvent or firefox will throw an error

    event.initEvent(null, false, false);
    equals(event.type, '','.type has expected value');
    equals(event.cancelable, false,'.cancelable has expected value');
    equals(event.bubbles, false,'.bubbles has expected value');

    event.initEvent('ABC', true, true);
    equals(event.type, 'ABC','.type is mutable via initEvent');
    equals(event.cancelable, true,'.cancelable is mutable via initEvent');
    equals(event.bubbles, true,'.bubbles is mutable via initEvent');

    event.initEvent('ENVJS', null, null);
    equals(event.type, 'ENVJS','.type has expected value');
    equals(event.cancelable, false,'.cancelable has expected value');
    equals(event.bubbles, false,'.bubbles has expected value');


});

test('document.createEvent("MouseEvents")', function(){

    var event;

    ok(event = document.createEvent('MouseEvents'), 'can create MouseEvents');
    ok(event.timeStamp > 0, '.timestamp has default value');
    equals(event.cancelable, true,'.cancelable has expected default value');
    equals(event.bubbles, true,'.bubbles has expected default value');
    equals(event.eventPhase, Event.AT_TARGET,'.eventPhase has expected default value');
    equals(event.currentTarget, null,'.currentTarget has expected default value');
    equals(event.target, null,'.target has expected default value');


});

test('document.createEvent("KeyEvents")', function(){

    var event;

    ok(event = document.createEvent('KeyEvents'), 'can create KeyEvents');
    ok(event.timeStamp > 0, '.timestamp has default value');
    equals(event.cancelable, true,'.cancelable has expected default value');
    equals(event.bubbles, true,'.bubbles has expected default value');
    equals(event.eventPhase, Event.AT_TARGET,'.eventPhase has expected default value');
    equals(event.currentTarget, null,'.currentTarget has expected default value');
    equals(event.target, null,'.target has expected default value');

});

test('document.createEvent("UIEvents")', function(){

    var event;

    ok(event = document.createEvent('UIEvents'), 'can create UIEvents');
    ok(event.timeStamp > 0, '.timestamp has default value');
    equals(event.cancelable, true,'.cancelable has expected default value');
    equals(event.bubbles, true,'.bubbles has expected default value');
    equals(event.eventPhase, Event.AT_TARGET,'.eventPhase has expected default value');
    equals(event.currentTarget, null,'.currentTarget has expected default value');
    equals(event.target, null,'.target has expected default value');
    equals(event.detail, 0,'.detail has expected default value');
    //equals(event.view, _this,'.view has expected default value');

    // its interesting to note you can't access event.type
    // before calling initEvent or firefox will throw an error

    event.initUIEvent(null, false, false, null, null);
    equals(event.type, '','.type has expected value');
    equals(event.cancelable, false,'.cancelable has expected value');
    equals(event.bubbles, false,'.bubbles has expected value');
    equals(event.detail, 0,'.detail has expected value');
    equals(event.view, null,'.view has expected value');


});


test('document.createEvent("MutationEvents")', function(){

    var event;

    ok(event = document.createEvent('MutationEvents'), 'can create MutationEvents');
    ok(event.timeStamp === 0, '.timestamp has default value');
    equals(event.cancelable, false, '.cancelable has expected default value');
    equals(event.bubbles, true, '.bubbles has expected default value');
    equals(event.eventPhase, Event.AT_TARGET, '.eventPhase has expected default value');
    equals(event.currentTarget, null, '.currentTarget has expected default value');
    equals(event.target, null, '.target has expected default value');

});


test('document.createEvent("FooEvents")', function(){

    var event;

    try{
        event = document.createEvent('FooEvents');
        ok(false, 'can create FooEvents');
    }catch(e){
        ok(true, 'Unsupported Operation (cannot create FooEvents)');
    }

});


test('element.addEventListener / element.dispatchEvent', function(){
    expect(20);
    // <div id="thediv"><a href="/" id="thelink">test</a></div>

    var doc,
    event,
    div,
    link,
    text,
    next = 1;

    doc = document.implementation.createDocument(null,'div', null);
    div = doc.documentElement;
    div.setAttribute('id', 'thediv');
    link = doc.createElement('link');
    link.setAttribute('href', '/');
    link.setAttribute('id', 'thelink');
    div.appendChild(link);
    text = doc.createTextNode('test');
    link.appendChild(text);

    div.addEventListener('click', function(event){
        equals(event.eventPhase, Event.CAPTURING_PHASE, '.eventPhase is CAPTURE_PHASE');
        equals(event.currentTarget, div, '.currentTarget is div');
        equals(event.target, link, '.target is link');
        equals(next, 1, 'captured event in the correct order');
        next = 2;
    }, true);
    div.addEventListener('click', function(event){
        next++;
        equals(event.eventPhase, Event.BUBBLING_PHASE, '.eventPhase is BUBBLING_PHASE');
        equals(event.currentTarget, div, '.currentTarget is div');
        equals(event.target, link, '.target is link');
        equals(next, 5, 'bubbled event in the correct order');
    }, false);
    link.addEventListener('click', function(event){
        equals(event.eventPhase, Event.AT_TARGET, '.eventPhase is AT_TARGET');
        equals(event.currentTarget, link, '.currentTarget is link');
        equals(event.target, link, '.target is link');
        equals(next, 2, 'captured event in the correct order');
        next++;
    }, true);
    link.addEventListener('click', function(event){
        equals(event.eventPhase, Event.AT_TARGET, '.eventPhase is AT_TARGET');
        equals(event.currentTarget, link, '.currentTarget is link');
        equals(event.target, link, '.target is link');
        ok( next == 3 || next === 4,  'trigger event on target (registered first, actual :' +(next)+')');
        next++;
    }, false);
    link.addEventListener('click', function(event){
        equals(event.eventPhase, Event.AT_TARGET, '.eventPhase is AT_TARGET');
        equals(event.currentTarget, link, '.currentTarget is link');
        equals(event.target, link, '.target is link');
        ok( next == 4 || next === 3,  'trigger event on target  (registered second, actual :' +(next)+')');
        next = 4;
    }, false);

    event = doc.createEvent('HTMLEvents');
    event.initEvent('click', true, true);
    link.dispatchEvent(event);
});

test('element.addEventListener / element.dispatchEvent multiple listeners', function(){
    expect(6);
    // <div id="thediv"></div>

    var doc,
    event,
    div;

    doc = document.implementation.createDocument(null,'div', null);
    div = doc.documentElement;
    div.setAttribute('id', 'thediv');

    div.addEventListener('click', function(event){
        equals(event.eventPhase, Event.AT_TARGET, '.eventPhase is AT_TARGET');
        equals(event.currentTarget, div, '.currentTarget is div');
        equals(event.target, div, '.target is div');
    }, false);
    div.addEventListener('click', function(event){
        equals(event.eventPhase, Event.AT_TARGET, '.eventPhase is AT_TARGET');
        equals(event.currentTarget, div, '.currentTarget is div');
        equals(event.target, div, '.target is div');
    }, false);

    event = doc.createEvent('HTMLEvents');
    event.initEvent('click', true, true);
    div.dispatchEvent(event);
});

