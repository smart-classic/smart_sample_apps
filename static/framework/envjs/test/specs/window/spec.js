module('window');

window.ABC1234567890 = "abc!@#$%^&*()";

var __this__ = this;

function pollute(){
    abc = 123;
};
function giveAHoot(){
    var def = 456;
}


test('Window Interfaces Available', function(){
    
    ok(Window,      'Window available');
    ok(History,     'History available');
    ok(Navigator,   'Navigator available');
    ok(Screen,      'Screen available');
    
});
    
test('window proxy', function(){
    equals(window.THISISNOTDEFINED, undefined, 'window.undefined');
    equals(window.document, document, 'window.document('+window.document+') is document('+document+')');
    equals(document.nodeType, Node.DOCUMENT_NODE, 'document.nodeType is correct');
    
    pollute();
    equals(abc, 123, 'unscoped variables pollute the global scope');
    
    giveAHoot();
    try{
        def;
        ok(false, 'scoped variables dont pollute the global scope');
    }catch(e){
        //rhino adds double quotes around the bad variable eg "def" instead of just def 
        //rhino also adds a period at the end
        ok(e.toString().match(/^ReferenceError:\s\"?def\"?\sis\snot\sdefined\.?$/), 'got ReferenceError');
        ok(true, 'scoped variables dont pollute the global scope');
    }
    
    var tmp = new Date().getTime()+'';
    window[tmp] = 'hello!';
    same(window[tmp], 'hello!', 'setting property on window');
    delete window[tmp];
    same(window[tmp], undefined, 'deleting property on window');
    
});

test('window properties', function(){

    expect(23);
    ok(window,              'window');
    ok(self,                'self');
    ok(top,                 'top');
    ok(parent,              'parent');
    ok(window.toString(),   '[object Window]');
    
    //these values are usually the empty string ''
    //so we just verify the property is available
    ok('name' in window,            'name');
    ok('status' in window,          'status');
    ok('closed' in window,          'closed');
    ok('defaultStatus' in window,   'defaultStatus');
    ok('length' in window,          'length');
    ok('opener' in window,          'opener');
    
    ok(frames,              'frames');
    ok(open,                'open');
    ok(close,               'close');
    ok(innerHeight,         'innerHeight');
    ok(outerHeight,         'outerHeight');
    ok(outerWidth,          'outerWidth');
    ok(Number(screenX) !== undefined,             'screenX');
    ok(Number(screenY) !== undefined,             'screenY');
    
    equals( window, __this__,   'window is the global scope "this"');
    equals( window, self,       'self is an alias for window');
    equals( window, top,        'top is an alias for window when the window is not in a frame');
    equals( window, window.parent, 'window parent is itself');
    
});

test('window event target', function(){
    
    ok(window.addEventListener, '.addEventListener');
    ok(window.removeEventListener, '.removeEventListener');
    ok(window.dispatchEvent, '.dispatchEvent');
    
});

test("window.navigator", function(){
    expect(9);
    ok(navigator === window.navigator, 'navigator is window.navigator');
    ok(navigator.userAgent,         '.userAgent is defined');
    ok(navigator.appCodeName,       '.appCodeName is defined');
    ok(navigator.appName,           '.appName is defined');
    ok(navigator.appVersion,        '.appVersion is defined');
    //ok(navigator.language,          '.language is defined');
    ok(navigator.mimeTypes,         '.mimeTypes is defined');
    //ok(navigator.platform,          '.platform is defined');
    //ok(navigator.oscpu,             '.oscpu is defined');
    //ok(navigator.product,           '.product is defined');
    //ok(navigator.productSub,        '.productSub is defined');
    ok(navigator.plugins,           '.plugins is defined');
    ok(navigator.cookieEnabled,     '.cookieEnabled is defined');
    //ok(navigator.buildID,           '.buildID is defined');
    ok(navigator.javaEnabled,       '.javaEnabled is defined');
    //ok(navigator.taintEnabled,      '.taintEnabled is defined');
    //ok(navigator.preference,        '.preference is defined');
    //ok(navigator.geolocation,       '.geolocation is defined');
    //ok(navigator.registerContentHandler, '.registerContentHandler is defined');
    //ok(navigator.registerProtocolHandler, '.registerProtocolHandler is defined');
    
    /*
     * several properties will throw a security exception if they 
     * are accessed, so we only check that they exist
     */
    //ok("vendor" in navigator,            '.vendor is defined');
    //ok("vendorSub" in navigator,         '.vendorSub is defined');
    //ok("securityPolicy" in navigator,    '.securityPolicy is defined');
    //ok("onLine" in navigator,            '.onLine is defined');
});

test('window.getComputedStyle', function(){

    expect(1);
    ok(window.getComputedStyle, 'window.getComputedStyle');
    
});


test('window.dialog', function(){

    expect(3);
    ok(alert,   'alert');
    ok(confirm, 'confirm');
    ok(prompt,  'prompt');
    
});

test('window.history', function(){
    
    expect(8);
    ok(history === window.history, "history is window.history");
    ok(history.length,   'history.length');
    ok(history.back,     'history.back');
    ok(history.forward,  'history.forward');
    ok(history.go,       'history.go');
    ok(history.item,     'history.item');
    
    //these are generally secured properties of the history
    //object so we only check that the are defined since
    //trying to access them will throw an exception
    ok('current'  in history,  'history.current');
    ok('previous' in history,  'history.previous');
    
});


test('window.event', function(){
    
    expect(3);
    ok(addEventListener,    'addEventListener');
    ok(removeEventListener, 'removeEventListener');
    ok(dispatchEvent,       'dispatchEvent');
    
});

test('window.location', function(){
    
    expect(12);
    ok(location === window.location, "location is window.location");
    ok('href' in location,      'location.href');
    ok('hash' in location,      'location.hash');
    ok('host' in location,      'location.host');
    ok('hostname' in location,  'location.hostname');
    ok('pathname' in location,  'location.pathname');
    ok('port' in location,      'location.port');
    ok('search' in location,    'location.search');
    ok(location.protocol,       'location.protocol');
    ok(location.reload,         'location.reload');
    ok(location.replace,        'location.replace');
    ok(location.assign,         'location.assign');
    
});

test('window.screen', function(){
    
    expect(18);
    ok(screen === window.screen , 'screen is window screen');
    ok("top" in screen,          'top');
    ok(screen.height,       'height');
    ok(screen.width,        'width');
    ok("left" in screen,         'left');
    ok(screen.pixelDepth,   'pixelDepth');
    ok(screen.colorDepth,   'colorDepth');
    ok(screen.availWidth,   'availWidth');
    ok(screen.availHeight,  'availHeight');
    ok("availLeft" in screen,    'availLeft');
    ok("availTop" in screen,     'availTop');
    
    //closely related function available at window
    ok(moveBy,              'moveBy');
    ok(moveTo,              'moveTo');
    ok(resizeBy,            'resizeBy');
    ok(resizeTo,            'resizeTo');
    ok(scroll,              'scroll');
    ok(scrollBy,            'scrollBy');
    ok(scrollTo,            'scrollTo');
    
});


test('window.addEventListener / window.dispatchEvent multiple listeners', function(){
    expect(36);
    
    var event;
    
    window.addEventListener('foo', function(event){
        equals(event.eventPhase, Event.AT_TARGET, '.eventPhase is AT_TARGET');
        equals(event.currentTarget, window, '.currentTarget is window');
        equals(event.target, window, '.target is window');
    }, false);
    window.addEventListener('foo', function(event){
        equals(event.eventPhase, Event.AT_TARGET, '.eventPhase is AT_TARGET');
        equals(event.currentTarget, window, '.currentTarget is window');
        equals(event.target, window, '.target is window');
    }, false);
    
    event = document.createEvent('HTMLEvents');
    event.initEvent('foo', true, true);
    window.dispatchEvent(event);
    
    event = document.createEvent('HTMLEvents');
    event.initEvent('foo', false, true);
    window.dispatchEvent(event);
    
    
    window.addEventListener('bar', function(event){
        equals(event.eventPhase, Event.AT_TARGET, '.eventPhase is AT_TARGET');
        equals(event.currentTarget, window, '.currentTarget is window');
        equals(event.target, window, '.target is window');
    }, true);
    window.addEventListener('bar', function(event){
        equals(event.eventPhase, Event.AT_TARGET, '.eventPhase is AT_TARGET');
        equals(event.currentTarget, window, '.currentTarget is window');
        equals(event.target, window, '.target is window');
    }, true);
    
    event = document.createEvent('HTMLEvents');
    event.initEvent('bar', true, true);
    window.dispatchEvent(event);
    
    event = document.createEvent('HTMLEvents');
    event.initEvent('bar', false, true);
    window.dispatchEvent(event);
    
    window.addEventListener('goop', function(event){
        equals(event.eventPhase, Event.AT_TARGET, '.eventPhase is AT_TARGET');
        equals(event.currentTarget, window, '.currentTarget is window');
        equals(event.target, window, '.target is window');
    }, true);
    window.addEventListener('goop', function(event){
        equals(event.eventPhase, Event.AT_TARGET, '.eventPhase is AT_TARGET');
        equals(event.currentTarget, window, '.currentTarget is window');
        equals(event.target, window, '.target is window');
    }, false);
    
    event = document.createEvent('HTMLEvents');
    event.initEvent('goop', true, true);
    window.dispatchEvent(event);
    
    event = document.createEvent('HTMLEvents');
    event.initEvent('goop', false, true);
    window.dispatchEvent(event);
});


test('HTMLParser.parseDocument / non-polluting script', function(){
    //one of the easiest way to test the HTMLParser is using frames and 
    //writing the document directly
    expect(4);
    var iframe = document.createElement("iframe"),
        doc,
        win;
        
    document.body.appendChild(iframe);
    doc = iframe.contentDocument;
    win = iframe.contentWindow;
    
    doc.open();
    doc.write("<html><head><script>var ABABABABAB = 123;</script></head><body>hello</body></html>");
    doc.close();
    ok(doc, 'frame has contentDocument');
    equals(doc+'', '[object HTMLDocument]', 'doc is HTMLDocument');
    equals(win.ABABABABAB, 123, 'script evaluated in frame context');
    try{
        ABABABABAB;
        ok(false, 'script not evaluated top window context: '+ABABABABAB);
    }catch(e){
        ok(true, 'script not evaluated top window context');
    }
    document.body.removeChild( iframe );
});

test('HTMLParser.parseDocument / polluting script', function(){
    //one of the easiest way to test the HTMLParser is using frames and 
    //writing the document directly
    expect(4);
    var iframe = document.createElement("iframe"),
        doc,
        win;
        
    document.body.appendChild(iframe);
    doc = iframe.contentDocument;
    win = iframe.contentWindow;
    
    doc.open();
    doc.write("<html><head><script>ABABABABAB = 123;</script></head><body>hello</body></html>");
    doc.close();
    ok(doc, 'frame has contentDocument');
    equals(doc+'', '[object HTMLDocument]', 'doc is HTMLDocument');
    equals(win.ABABABABAB, 123, 'script evaluated in frame context');
    try{
        ABABABABAB;
        ok(false, 'script not evaluated top window context: '+ABABABABAB);
    }catch(e){
        ok(true, 'script not evaluated top window context');
    }
    document.body.removeChild( iframe );
});



test('frame proxy', function(){

    var frame,
        doc;
    
    expect(7);
    frame = document.createElement('iframe');
    frame.width = '100%';
    frame.height = '380px';
    frame.frameBorder = '0';
    frame.addEventListener('load', function(){

        equals(frame.contentWindow.parent, window, '.contentWindow.parent');
        equals(frame.contentWindow.top, window, '.contentWindow.top');
        
        ok(frame.contentWindow.Array !== window.Array, '.Array');
        ok(new window.Array(), 'new Array');
        ok(new frame.contentWindow.Array(), 'new Array');
        
        doc = frame.contentDocument;
        equals(doc.title, 'Envjs Proxy Spec', '.contentDocument.title');
        equals(doc.toString(), '[object HTMLDocument]', '.contentDocument.toString()');

        /**
         * TODO move this to its own test
        document.body.removeChild( frame );
        
        equals(frame.contentWindow, null, '.contentWindow');
        equals(frame.contentDocument, null, '.contentDocument');
         */
        start();
    }, false);
    
    frame.src = '../frame/proxy.html';
    document.body.appendChild(frame);
    stop();
});


