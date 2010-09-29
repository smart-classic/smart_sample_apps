QUnit.module('timer');
test('Timer Interfaces Available', function(){

    expect(4);
    ok(setTimeout,      'setTimeout');
    ok(setInterval,     'setInterval');
    ok(clearTimeout,    'clearTimeout');
    ok(clearInterval,   'clearInterval');

});

/**
 * When passing a string to the set-timeout, it is evaluated in global scope
 *
 */
test('setTimeoutScopeString', function() {
    expect(1);
    var BOGON = 1;
    setTimeout("equals(typeof BOGON, 'undefined'); start();", 10);
    stop();
});


/**
 * This case works, since the function is under a closure
 *
 */
test('setTimeoutScopeFunction', function() {
    expect(1);
    var BOGON = 1;
    setTimeout(function() {equals(typeof BOGON, 'number'); start();}, 10);
    stop();
});

test('setTimeout', function(){

    expect(2);
    var order = 1,
    id;

    id = setTimeout(function(){
        equals(order, 2, 'callback');
        start()
    }, 10);

    equals(order++, 1, 'callstack');
    stop();

});


test('clearTimeout', function(){

    expect(2);
    var order = 1,
    id1, id2;

    id1 = setTimeout(function(){
        ok(false, 'should have cancelled');
        start()
    }, 10);


    id2 = setTimeout(function(){
        equals(order, 2, 'callback');
        start()
    }, 10);

    equals(order++, 1, 'callstack');
    clearTimeout(id1);
    stop();

});


test('setInterval / clearInterval', function(){

    expect(10);
    var order = 1,
    id;

    id = setInterval(function(){
        if(order < 10){
            ok(order++, 'interval callback');
        }else{
            equals(order, 10, 'final callback');
            clearInterval(id);
            start();
        }
    }, 50);

    equals(order++, 1, 'callstack');
    stop();

});

