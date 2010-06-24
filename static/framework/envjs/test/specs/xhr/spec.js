module('xhr');

test('XMLHttpRequest Interfaces Available', function(){
    
    expect(2);
    ok(Location,           'Location defined');
    ok(XMLHttpRequest,     'XMLHttpRequest defined');
    
});

// mock the global document object if not available
var expected_path = 'test/specs/xhr/index.html';
    
try{
    document;
}catch(e){
    console.log('mocking global document object.');
    document = new HTMLDocument(new DOMImplementation());
    
    console.log('mocking global document location.');
    location = new Location(Envjs.uri(expected_path, SETTINGS.AJAX_BASE), document);
    document.baseURI = location.href;
    location.reload();
    
    console.log('WARNING: AJAX TESTS WILL FAIL WITHOUT A SERVER AND local_settings.js');
}

test('Location', function(){
    
    var href = SETTINGS.AJAX_BASE+expected_path;
    
    ok(//this test may run in xhr or env so we allow for both paths
        location.toString() === href || 
        location.toString() === href.replace('xhr','env'), 
        '.toString()'
    );
    equals(location.hash, '', '.hash');
    equals(location.host, 'localhost:8080', '.host');
    equals(location.hostname, 'localhost', '.hostname');
    ok(//this test may run in xhr or env so we allow for both paths
        location.href === href || 
        location.href === href.replace('xhr','env'), 
        '.href'
    );
    ok(//this test may run in xhr or env so we allow for both paths
        location.pathname === '/env-js/'+expected_path || 
        location.pathname === ('/env-js/'+expected_path).replace('xhr','env'), 
        '.href'
    );
    equals(location.port, '8080', '.port');
    equals(location.protocol, 'http:', '.protocol');
    equals(location.search, '', '.search');
    
});

test('XMLHttpRequest sync', function(){
    var xhr,
        url;
        
    url = SETTINGS.AJAX_BASE +'test/fixtures/simple.txt';
    
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
    var xhr,
        url;
        
    url = SETTINGS.AJAX_BASE +'test/fixtures/simple.txt';
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


test('HTMLParser document.writeln', function(){
    
    ok(document.getElementById('writeln'), 'document.writeln created a div during parsing');
    
});
