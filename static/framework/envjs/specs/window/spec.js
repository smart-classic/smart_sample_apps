QUnit.module('window');

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

    expect(24);
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
    ok(window.onload === undefined ,         'onload');
    //ok(window.onunload === undefined,          'onunload');
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

    // HTML5 March 2010: no one implements resolveURL
    //ok(location.assign,         'location.resolveURL');
});

if (runningUnderEnvjs()){
    /* This test won't run in a browser.  In-browser testing with
     * modern versions of IE, Safari, and FF shows that "Location"
     * ranges from being entirely undefined to not callable as an
     * object constructor, but Envjs seems to be the only system that
     * allows for instances of the Location object outside of being a
     * member of the 'window' object.  I'm leaving the test as it is
     * written, however, because performing these validations on
     * window.location itself would cause the browser (simulation) to
     * attempt to navigate all over the place creating huge problems.
     */

    test('Location object', function() {
        // to use the example from
        // https://developer.mozilla.org/En/DOM/Window.location
        var x = new Location('http://www.google.com:80/search?q=devmo#test');

        // we are modifying x.assign to we can intercept the new
        // reconstituted url
        x.assign = function(url) {};

        // test basic parsing
        equals(x.hash, '#test');
        equals(x.host, 'www.google.com:80');
        equals(x.hostname, 'www.google.com');
        equals(x.href, 'http://www.google.com:80/search?q=devmo#test');
        equals(x.pathname, '/search');
        equals(x.protocol, 'http:');
        equals(x.port, '80');
        equals(typeof x.port, 'string');
        equals(x.search, '?q=devmo');

        // setter for hostname
        x = Location('http://www.google.com:80/search?q=devmo#test');
        x.assign = function(url) {};
        // TBD, not clear what should happen
        // SafarI 4: accept
        // Firefox 3.6: Error
        x.protocol = '';
        // envjs crash
        //equals(x.protocol, 'http:', 'Setting protocol to emptry string is ignored');
        x.protocol = 'https:';
        equals(x.protocol, 'https:', 'Setting protocol with trailing colon');
        x.protocol = 'http';
        equals(x.protocol, 'http:', 'Setting protocol without trailing colon');

        // setter for host
        x = Location('http://www.google.com:80/search?q=devmo#test');
        x.assign = function(url) {};
        x.host = '';
        // SafarI 4: accept (infinite loop)
        // Firefox 3.6: Error
        equals(x.host, 'www.google.com:80', 'Setting host to emptry string is ignored');

        x.host = 'www.yahoo.com';
        equals(x.host, 'www.yahoo.com', 'Setting host with no port')
        equals(x.hostname, 'www.yahoo.com', 'Setting host updates hostname');
        equals(x.port, '', 'Setting host updates port');
        equals(x.href, 'http://www.yahoo.com/search?q=devmo#test');

        x.host = 'www.google.com:80';
        equals(x.host, 'www.google.com:80', 'Setting host with port');
        equals(x.hostname,'www.google.com', 'Setting host updates hostname');
        equals(x.port, '80', 'Setting host updates port');
        equals(x.href, 'http://www.google.com:80/search?q=devmo#test');

        // setter for host
        x = Location('http://www.google.com:80/search?q=devmo#test');
        x.assign = function(url) {};
        x.host = 'www.yahoo.com';
        equals(x.host, 'www.yahoo.com');

        // setter for port
        // Safari 4: file://:90/Users/nickg/javascript.html
        // Firefox: Error
        x = Location('http://www.google.com:80/search?q=devmo#test');
        x.assign = function(url) {};
        x.port = 81;
        equals(x.port, 81, 'Setting port as integer');
        equals(x.host, 'www.google.com:81');
        equals(x.href, 'http://www.google.com:81/search?q=devmo#test');
        x.port = '82';
        equals(x.port, '82', 'Setting port as string');
        equals(x.host, 'www.google.com:82');
        equals(x.href, 'http://www.google.com:82/search?q=devmo#test');

        // setter for path
        x = Location('http://www.google.com:80/search?q=devmo#test');
        x.assign = function(url) {};
        x.pathname = '/foo';
        equals(x.pathname, '/foo', 'Setting path starting with "/"');
        equals(x.href, 'http://www.google.com:80/foo?q=devmo#test');
        x.pathname = 'foobar';
        equals(x.pathname, '/foobar', 'Setting path starting without "/"');
        equals(x.href, 'http://www.google.com:80/foobar?q=devmo#test');

        // setter for search (query string)
        x = Location('http://www.google.com:80/search?q=devmo#test');
        x.assign = function(url) {};
        x.search='?q=foo';
        equals(x.search, '?q=foo', 'Setting search with starting "?"');
        equals(x.href, 'http://www.google.com:80/search?q=foo#test');
        x.search='q=bar';
        equals(x.search, '?q=bar', 'Setting search without starting "?"');
        equals(x.href, 'http://www.google.com:80/search?q=bar#test');

        // setter for hash (fragment)
        x = Location('http://www.google.com:80/search?q=devmo#test');
        x.assign = function(url) {};
        x.hash = '#foo';
        equals(x.hash, '#foo', 'Setting hash with starting "#"');
        equals(x.href, 'http://www.google.com:80/search?q=devmo#foo');
        x.hash = '#bar';
        equals(x.hash, '#bar', 'Setting hash without starting "#"');
        equals(x.href, 'http://www.google.com:80/search?q=devmo#bar');
    });
}

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

	//allow anonymous script types
	if (runningUnderEnvjs())
		Envjs.scriptTypes[""] = true;
    doc.open();
    doc.write("<html><head><script>var ABABABABAB = 123;</script></head><body>hello</body></html>");
    doc.close();
	if (runningUnderEnvjs())
		Envjs.scriptTypes[""] = false;
	
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

	//allow anonymous script types
	if (runningUnderEnvjs())
		Envjs.scriptTypes[""] = true;
    doc.open();
    doc.write("<html><head><script>ABABABABAB = 123;</script></head><body>hello</body></html>");
    doc.close();
	if (runningUnderEnvjs())
		Envjs.scriptTypes[""] = false;
	
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

/*
 * Unfortunately, the exception is swallowed in html/document.js
 * so we can't test it. (search for 'error loading html element')
 * However this cause some error output to printed to console.
 */

test('HTMLParser.parseDocument / empty script', function(){
    //one of the easiest way to test the HTMLParser is using frames and
    //writing the document directly
    expect(1);
    var iframe = document.createElement("iframe"),
    doc,
    win;
    document.body.appendChild(iframe);
    doc = iframe.contentDocument;
    win = iframe.contentWindow;

    try {
        doc.open();
        doc.write("<html><head><script></script></head><body>hello</body></html>");
        doc.close();
        ok(true, 'empty script was correctly ignored');
    } catch (e) {
        ok(false, 'empty script causes exception:' + e);
    }

});

test('HTMLParser document.writeln', function(){
    
    ok(document.getElementById('writeln'), 'document.writeln created a div during parsing');
    
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

test('window.[atob|btoa]', function(){
    ok(window.atob,      'window.atob available');
    ok(window.btoa,      'window.btoa available');

    equals(window.btoa('1234'),  'MTIzNA==',    'smoke test for btoa');
    equals(window.atob('MTIzNA=='),  '1234',    'smoke test for atob');
});

test('window.getComputedStyle', function() {
    // getComputedStyle is more of a stub than an engine that really
    // computes styles. Test to make sure the objects-in, objects-out
    // and behavior on errors is correct

    // first test to make sure dependencies are correct
    //ok(CSS2Properties, 'Dependencies CSS2Properties exists');
    ok(window.getComputedStyle, 'getComputedStyle exists');

    // TODO: make this better.  See notes in
    // window.getComputedProperty
    //
    // ok(window.getComputedStyle(), 'getComputedStyle with no args returns non-null');

});


/**
 * Not sure where this goes, since it needs the parser
 */
test('Document Named Element Lookup', function(){
    if (runningUnderEnvjs())
        expect(7);
    else
        expect(6);

    var iframe = document.createElement("iframe");
    document.body.appendChild(iframe);
    var doc = iframe.contentDocument;
    doc.open();
    doc.write(
        '<html><head></head><body><form name="foo"><input name="goop"/></form></body></html>');
    doc.close();

    var nodelist = doc.getElementsByName('foo');
    equals(nodelist.length, 1);
    var node = doc.foo;
    ok(node, 'named lookup finds element');
    equals(nodelist[0], node, 'element is one expected');
	node = doc.foo.goop;
    ok(node, 'named lookup finds element');

    // ok now let's try to use innerHTML
    var str = '<form name="bar"></form>';
    doc.body.innerHTML = str;
    ok(doc.bar, 'named lookup after innerHTML');

    // the other one should be zapped
    nodelist = doc.getElementsByName('foo');
    equals(nodelist.length, 0, 'old named element not found ByName');

    //I think it is actually a Firefox bug that this test doesn't pass there
    if (runningUnderEnvjs())
        ok(!doc.foo, 'old named element not found via named lookup');
});


test('Default Browser Events - Form method "get"', function(){
    var windowExchangeTests = document.getElementById('window_exchange_tests'); 
    ok(windowExchangeTests, 'window_exchange_tests frame available');
    
    windowExchangeTests.onload = function(){
        ok(windowExchangeTests.contentDocument.getElementById('link_tests'), 'new page loaded');
        start();
    }
    
    var formTest1 = windowExchangeTests.contentDocument.getElementById('form_test_1');
    formTest1.submit();
    stop();
    
});


test('Default Browser Events - Serialized Submit Button', function(){
    var submitButtonTests = document.getElementById('submit_button_tests'); 
    ok(submitButtonTests, 'submit_button_tests frame available');
    
    submitButtonTests.onload = function(){
        ok(submitButtonTests.contentDocument.getElementById('link_tests'), 'new page loaded');
		ok(submitButtonTests.contentDocument.location.search.match('&submit1=yes'), 
			'correct submit button value serialized');
		ok(!submitButtonTests.contentDocument.location.search.match('submit2'), 
			'incorrect submit button value not serialized');
        start();
    }
    
    var submit1 = submitButtonTests.contentDocument.getElementById('s1');

    var event = submitButtonTests.contentDocument.createEvent('HTMLEvents');
    event.initEvent('click', false, true);
    submit1.dispatchEvent(event);
    stop();
    
});


test('Default Browser Events - Remote Link 1', function(){
    var windowExchangeTests = document.getElementById('window_exchange_tests'); 
    ok(windowExchangeTests, 'window_exchange_tests frame available');
    
    windowExchangeTests.onload = function(){
        ok(windowExchangeTests.contentDocument.getElementById('form_tests'), 'new page loaded');
        start();
    }
    
    var linkTest1 = windowExchangeTests.contentDocument.getElementById('link_test_1');
    
    var event = windowExchangeTests.contentDocument.createEvent('HTMLEvents');
    event.initEvent('click', false, true);
    linkTest1.dispatchEvent(event);
    stop();
    
});


test('Frameset', function(){
    var frameset_tests = document.getElementById('frameset_tests'); 
    ok(frameset_tests, 'frameset_tests available');
	equals(frameset_tests.contentDocument.body.tagName, "FRAMESET", "frameset is returned for document.body");
	equals(frameset_tests.contentWindow.parent, window, "frameset parent is window");
	equals(frameset_tests.contentDocument.getElementById('fs1').contentWindow.parent, 
		frameset_tests.contentWindow, "frame parent is frame '#frameset_tests'");
	equals(frameset_tests.contentDocument.body.innerHTML, 
		'<frame id="fs1" src="links.html"/><noframes>frames not supported</noframes>', 
		'frameset serialized');
    
});

test('Nested Frameset', function(){
    var nested_frameset_tests = document.getElementById('nested_frameset_tests'); 
    ok(nested_frameset_tests, 'nested_frameset_tests available');
	equals(nested_frameset_tests.contentDocument.getElementById('fsc').contentDocument.title, 
		"c", "nested frameset loaded correctly");

    
});
