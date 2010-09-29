QUnit.module('integration');

/**
 * This is very different from the other tests in that the "work"
 * in done, //outside// of a test().  The test() just check the
 * final results.  This is needed since the tests must run in
 * <head> tag of the main document.
 */

var isenvjs;
try {
    isenvjs = runningUnderEnvjs();
} catch (e) {
    isenvjs= false;
}
/**
 * If a script in running in <head>, then document.body === null
 *
 * Due to frame scoping rules, we have indirectly make the test.
 * What we are really doing is this:
 * <html><head><script>
 *   ok(document.body === null);
 * </script><head><body></body></html>
 */
document.bodyinhead = document.body;

/**
 * in <head>
 *   Create a new <script> element attached to <head>
 *   It should be run immediately(?)
 *
 */
var s = document.createElement('script');
s.type = "text/javascript";
s.text = "document.fired = true;";
document.documentElement.getElementsByTagName("head")[0].appendChild(s)

test('document.body is null in head', function() {
    expect(1);
    ok(document.bodyinhead === null, 'doc.body === null');
});

test('added new script to head from head', function() {
    expect(1);
    ok(document.fired === true, 'appended script element ran');
});