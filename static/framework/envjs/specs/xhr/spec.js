QUnit.module('xhr');

test('XMLHttpRequest Interfaces Available', function(){
    
    expect(2);
    ok(Location,           'Location defined');
    ok(XMLHttpRequest,     'XMLHttpRequest defined');
    
});

var expected_path_a = 'specs/xhr/index.html';
var expected_path_b = 'specs/xhr/';
var url = SETTINGS.AJAX_BASE +'specs/fixtures/simple.txt',
	absolute_url = '/specs/fixtures/simple.txt';
    
// mock the global document object if not available
try{
    document;
}catch(e){
    console.log('mocking global document object.');
	
    window = document = new HTMLDocument(new DOMImplementation());
    
    console.log('mocking global document location.');
    location = new Location(
		Envjs.uri(expected_path_a, SETTINGS.AJAX_BASE),
        document
	);
    document.baseURI = location.href;
    location.reload();
	
    console.log('WARNING: AJAX TESTS WILL FAIL WITHOUT A SERVER AND local_settings.js');
}

test('Location', function(){
    
    var href_a = SETTINGS.AJAX_BASE+expected_path_a;
    var href_b = SETTINGS.AJAX_BASE+expected_path_b;
    
    ok(//this test may run in xhr or env so we allow for both paths
        location.toString() === href_a ||
            location.toString() === href_b ||
            location.toString() === href_a.replace('xhr','env'),
        '.toString()'
    );
    equals(location.hash, '', '.hash');
    var port = (SETTINGS.LOCAL_PORT == "") ? "" : (":" + SETTINGS.LOCAL_PORT);
    equals(location.host, 'localhost'+port, '.host');
    equals(location.hostname, 'localhost', '.hostname');
    ok(
        location.href === href_a ||
            location.href === href_b ||
            //this test may run in xhr or env so we allow for both paths
            location.href === href.replace('xhr','env'),
        '.href'
    );
    ok(
        location.pathname === SETTINGS.APP_CONTEXT+expected_path_a ||
            location.pathname === SETTINGS.APP_CONTEXT+expected_path_b ||
            //this test may run in xhr or env so we allow for both paths
            location.pathname === (SETTINGS.APP_CONTEXT+expected_path_b).
                                      replace('xhr','env'),
        '.href'
    );
    equals(location.port, SETTINGS.LOCAL_PORT, '.port');
    equals(location.protocol, 'http:', '.protocol');
    equals(location.search, '', '.search');
    
});

test('XMLHttpRequest sync', function(){
    var xhr;
        
    xhr = new XMLHttpRequest();
    equals(xhr.readyState, 0, '.readyState');
    
    xhr.open("GET", url, false);
    equals(xhr.readyState, 1, '.readyState');
    
    xhr.send();
    equals(xhr.readyState, 4, '.readyState');
    equals(xhr.responseText, 'Hello World', '.responseText');
    equals(xhr.responseXML, null, '.responseXML');
    equals(xhr.status, 200, '.status');
    equals(xhr.statusText, 'OK', '.statusText');
});


test('XMLHttpRequest async', function(){
    var xhr;
        
    xhr = new XMLHttpRequest();
    equals(xhr.readyState, 0, '.readyState');
    equals(xhr.responseText, '', '.responseText');
    equals(xhr.responseXML, null, '.responseXML');
    equals(xhr.status, 0, '.status');
    equals(xhr.statusText, '', '.statusText');
    
    xhr.open("GET", url, true);
    equals(xhr.readyState, 1, '.readyState');
    
    xhr.onreadystatechange = function(){
        if(xhr.readyState === 1){
            equals(xhr.responseText, '', '.responseText');
            equals(xhr.responseXML, null, '.responseXML');
            equals(xhr.status, 200, '.status');
            equals(xhr.statusText, 'OK', '.statusText');
         }else if(xhr.readyState === 2){
            equals(xhr.responseXML, null, '.responseXML');
            equals(xhr.status, 200, '.status');
            equals(xhr.statusText, 'OK', '.statusText');
         }else if(xhr.readyState === 3){
            equals(xhr.responseText, 'Hello World', '.responseText');
            equals(xhr.responseXML, null, '.responseXML');
            equals(xhr.status, 200, '.status');
            equals(xhr.statusText, 'OK', '.statusText');
         }else if(xhr.readyState === 4){
            equals(xhr.readyState, 4, '.readyState');
            equals(xhr.responseText, 'Hello World', '.responseText');
            equals(xhr.responseXML, null, '.responseXML');
            equals(xhr.status, 200, '.status');
            equals(xhr.statusText, 'OK', '.statusText');
            start();
         }else {
            ok(false, 'xhr failed');
            start();
         }
    };
        
    xhr.send();
    stop();
});

test('xhr for relative path', function(){
	var xhr;
        
    xhr = new XMLHttpRequest();
    equals(xhr.readyState, 0, '.readyState');
    equals(xhr.responseText, '', '.responseText');
    equals(xhr.responseXML, null, '.responseXML');
    equals(xhr.status, 0, '.status');
    equals(xhr.statusText, '', '.statusText');
    
    xhr.open("GET", absolute_url, true);
    equals(xhr.readyState, 1, '.readyState');
	xhr.onreadystatechange = function(){
        if(xhr.readyState === 4){
            equals(xhr.readyState, 4, '.readyState');
            equals(xhr.responseText, 'Hello World', '.responseText');
            equals(xhr.responseXML, null, '.responseXML');
            equals(xhr.status, 200, '.status');
            equals(xhr.statusText, 'OK', '.statusText');
            start();
         }
    };
        
    xhr.send();
    stop();
});




