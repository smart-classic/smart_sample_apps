module('timer');
test('Timer Interfaces Available', function(){
    
    expect(4);
    ok(setTimeout,      'setTimeout');
    ok(setInterval,     'setInterval');
    ok(clearTimeout,    'clearTimeout');
    ok(clearInterval,   'clearInterval');
    
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

