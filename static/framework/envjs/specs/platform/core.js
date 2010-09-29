load('specs/qunit.js');
load('specs/env.qunit.js');
QUnit.init();

load('dist/platform/core.js');

load('dist/platform/rhino.js');

load('dist/console.js');
load('settings.js');
load('local_settings.js');

module('platform-core');

var document = null,
    path = 'specs/env/spec.html';

test('Envjs.uri', function(){
    var uri;

    uri = Envjs.uri('specs/env/spec.html', 'http://envjs.com/abc123/');
    ok(uri, 'Able to create uri');
    equals(uri, 'http://envjs.com/abc123/'+path, 'uri');
    equals(uri.toString(), 'http://envjs.com/abc123/'+path, 'uri');

    document = {baseURI:'http://envjs.com/'};

    uri = Envjs.uri('specs/env/spec.html');
    ok(uri, 'Able to create uri');
    equals(uri, 'http://envjs.com/specs/env/spec.html', 'uri');
    equals(uri.toString(), 'http://envjs.com/specs/env/spec.html', 'uri');


    uri = Envjs.uri('specs/env/spec.html', 'http://envjs.com/');
    ok(uri, 'Able to create uri');
    equals(uri, 'http://envjs.com/specs/env/spec.html', 'uri');
    equals(uri.toString(), 'http://envjs.com/specs/env/spec.html', 'uri');

    document = null;

    uri = Envjs.uri('http://envjs.com/specs/env/spec.html');
    ok(uri, 'Able to create uri');
    equals(uri, 'http://envjs.com/specs/env/spec.html', 'uri');
    equals(uri.toString(), 'http://envjs.com/specs/env/spec.html', 'uri');

    //
    // test normalization behavior
    // http://foo.com --> http://foo.com/, etc.
    //

    uri = Envjs.uri('file:///foo/bar');
    equals(uri, 'file:///foo/bar', 'File, absolute, without ending "/"');

    uri = Envjs.uri('file:///foo/bar/');
    equals(uri, 'file:///foo/bar/', 'File, absolute, with ending "/"');

    uri = Envjs.uri('http://foo.com');
    equals(uri, 'http://foo.com/', 'http, absolute, without path, without ending "/"');

    uri = Envjs.uri('http://foo.com/');
    equals(uri, 'http://foo.com/', 'http, absolute, without path, with ending "/"');

    uri = Envjs.uri('https://foo.com');
    equals(uri, 'https://foo.com/', 'https, absolute, without path, without ending "/"');

    uri = Envjs.uri('https://foo.com/');
    equals(uri, 'https://foo.com/', 'https, absolute, without path, with ending "/"');

    uri = Envjs.uri('http://foo.com/bar');
    equals(uri, 'http://foo.com/bar', 'http, absolute, with path, without ending "/"');

    uri = Envjs.uri('http://foo.com/bar/');
    equals(uri, 'http://foo.com/bar/', 'http, absolute, with path, with ending "/"');

    uri = Envjs.uri('https://foo.com/bar');
    equals(uri, 'https://foo.com/bar', 'https, absolute, with path, without ending "/"');

    uri = Envjs.uri('https://foo.com/bar/');
    equals(uri, 'https://foo.com/bar/', 'https, absolute, with path, with ending "/"');

    // weird degenerate case.  Starting with double slash implies HTTP
    //   not a file URL.  Used on Very Large websites.
    uri = Envjs.uri('//foo.com/bar');
    equals(uri, 'http://foo.com/bar', 'degenerate url case');

    // make sure whatever is parsing this doesn't choke on ip address
    // or localhost
    uri = Envjs.uri('http://127.0.0.1/');
    equals(uri, 'http://127.0.0.1/', 'http, ip address');

    uri = Envjs.uri('http://localhost/');
    equals(uri, 'http://localhost/', 'http, localhost');

    // cleanup on file URLs
    uri = Envjs.uri('file:///foo/bar?query');
    equals(uri, 'file:///foo/bar', 'file with query');

    uri = Envjs.uri('file:///foo/bar?query#frag');
    equals(uri, 'file:///foo/bar', 'file with query and frag');

    uri = Envjs.uri('file:///foo/bar#frag');
    equals(uri, 'file:///foo/bar', 'file with frag');

    // Oddballs
    uri = Envjs.uri('javascript:')
    equals(uri, '', 'js 1');

    uri = Envjs.uri('javascript:false')
    equals(uri, '', 'js 2');

    uri = Envjs.uri('javascript:void')
    equals(uri, '', 'js 3');

    // URL Joins
    uri = Envjs.uri('specs/env/spec.html', 'http://envjs.com/');
    equals(uri, 'http://envjs.com/specs/env/spec.html', 'join');

    uri = Envjs.uri('/specs/env/spec.html', 'http://envjs.com/');
    equals(uri, 'http://envjs.com/specs/env/spec.html', 'join');

    uri = Envjs.uri('specs/env/spec.html', 'http://envjs.com');
    equals(uri, 'http://envjs.com/specs/env/spec.html', 'join');

    uri = Envjs.uri('/specs/env/spec.html', 'http://envjs.com');
    equals(uri, 'http://envjs.com/specs/env/spec.html', 'join');

    uri = Envjs.uri('specs/env/spec.html', 'http://envjs.com/foo');
    equals(uri, 'http://envjs.com/specs/env/spec.html', 'join');

    uri = Envjs.uri('specs/env/spec.html', 'http://envjs.com/foo/');
    equals(uri, 'http://envjs.com/foo/specs/env/spec.html', 'join');

    uri = Envjs.uri('/specs/env/spec.html', 'http://envjs.com/foo');
    equals(uri, 'http://envjs.com/specs/env/spec.html', 'join');

    uri = Envjs.uri('/specs/env/spec.html', 'http://envjs.com/foo/');
    equals(uri, 'http://envjs.com/specs/env/spec.html', 'join');

    uri = Envjs.uri('/specs/env/spec.html', 'http://envjs.com/foo/../bar/');
    equals(uri, 'http://envjs.com/specs/env/spec.html', 'join');

    uri = Envjs.uri('specs/env/spec.html', 'http://envjs.com/foo/../bar/');
    equals(uri, 'http://envjs.com/bar/specs/env/spec.html', 'join');

    uri = Envjs.uri('specs/.././env/spec.html', 'http://envjs.com/foo/.././bar/');
    equals(uri, 'http://envjs.com/bar/env/spec.html', 'join');
});

Envjs.cookieFile = function(){
    return Envjs.uri(SETTINGS.BASE_URI+'specs/fixtures/cookies.json');
};

test('Envjs.cookies', function(){
    equals(Envjs.getCookies('http://localhost/'), 'xyz=lala', 'domain with root path');
    equals(Envjs.getCookies('http://localhost/farm'), 'xyz=lala; pig=oink,oink', 'domain with subpath');
});


start();
