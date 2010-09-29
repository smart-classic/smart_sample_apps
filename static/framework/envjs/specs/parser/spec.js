QUnit.module('parser');

var isenvjs;
try {
    isenvjs = runningUnderEnvjs();
} catch (e) {
    isenvjs= false;
}

test('Parser Interfaces Available', function(){

    expect(1);
    ok(DOMParser,             'DOMParser defined');
    //These are non-standard but used internally by envjs
    //ok(XMLParser,             'XMLParser defined');
    //ok(HTMLParser,            'HTMLParser defined');

});

// mock the global document object if not available
try{
    document;
}catch(e){
    document = new HTMLDocument(new DOMImplementation());
}
var xmlserializer = new XMLSerializer();

test('DOMParser.parseFromString', function(){

    var domparser = new DOMParser(),
    xmlstring = '<root>oink, oink</root>',
    xmldoc = domparser.parseFromString(xmlstring, 'text/xml'),
    element,
    attribute,
    text;

    ok(xmldoc , 'parsed xml document');
    equals(xmldoc.attributes, null, '.attributes');
    //TODO: Should be true
    equals(xmldoc.async, true, '.async');
    //Not yet supported by Envjs
    //equals(xmldoc.characterSet, 'UTF-8', '.characterSet');
    equals(xmldoc.childNodes.length, 1, '.childNodes.length');
    //Not yet supported by Envjs
    //equals(xmldoc.contentType, 'text/xml', '.contentType');
    //equals(xmldoc.inputEncoding, 'UTF-8', '.inputEncoding');
    equals(xmldoc.localName, null, '.localName');
    equals(xmldoc.location, null, '.location');
    equals(xmldoc.namespaceURI, null, '.namespaceURI');
    equals(xmldoc.nodeName, "#document", '.nodeName');
    equals(xmldoc.nodeType, Node.DOCUMENT_NODE, '.nodeType');
    equals(xmldoc.nodeValue, null, '.nodeValue');
    equals(xmldoc.ownerDocument, null, '.ownerDocument');
    equals(xmldoc.parentNode, null, '.parentNode');
    equals(xmldoc.prefix, null, '.prefix');
    equals(xmldoc.textContent, null, '.textContent');

    element = xmldoc.documentElement;

    equals(element.attributes.length, 0, '.attributes.length');
    equals(element.childNodes.length, 1, '.childNodes.length');
    equals(element.localName, 'root', '.localName');
    equals(element.namespaceURI, null, '.namespaceURI');
    equals(element.nodeName, "root", '.nodeName');
    equals(element.nodeType, Node.ELEMENT_NODE, '.nodeType');
    equals(element.nodeValue, null, '.nodeValue');
    equals(element.ownerDocument, xmldoc, '.ownerDocument');
    equals(element.parentNode, xmldoc, '.parentNode');
    equals(element.prefix, null, '.prefix');
    equals(element.tagName, 'root', '.tagName');
    equals(element.textContent, 'oink, oink', '.textContent');

    text = element.childNodes[0];

    equals(text.attributes, null, '.attributes.length');
    equals(text.childNodes.length, 0, '.childNodes.length');
    equals(text.localName, null, '.localName');
    equals(text.namespaceURI, null, '.namespaceURI');
    equals(text.nodeName, "#text", '.nodeName');
    equals(text.nodeType, Node.TEXT_NODE, '.nodeType');
    equals(text.nodeValue, 'oink, oink', '.nodeValue');
    equals(text.ownerDocument, xmldoc, '.ownerDocument');
    equals(text.parentNode, element, '.parentNode');
    equals(text.prefix, null, '.prefix');
    equals(text.textContent, 'oink, oink', '.textContent');

    xmlstring = '<animals><pig>oink</pig><cow>moo</cow></animals>';
    xmldoc = domparser.parseFromString(xmlstring, 'text/xml');

    ok(xmldoc , 'parsed xml document');
    equals(xmldoc.documentElement.tagName, 'animals', 'documentElement.tagName');
    equals(xmldoc.getElementsByTagName('pig').length, 1, 'getElementsByTagName.length');
    equals(xmldoc.getElementsByTagName('cow').length, 1, 'getElementsByTagName.length');

    xmlstring =
        '<root xmlns="pig" xmlns:apig="apig" type="pig">'+
        'oink, oink'+
        '</root>';
    xmldoc = domparser.parseFromString(xmlstring, 'text/xml');

    ok(xmldoc , 'parsed xml document');
    equals(xmldoc.documentElement.tagName, 'root', 'documentElement.tagName');
    equals(xmldoc.documentElement.getAttribute('type'), 'pig', 'documentElement.getAttribute');


    xmlstring = '<?xml version="1.0" encoding="utf-8"?>\n'+
        '<root xmlns="pig" xmlns:apig="apig" type="pig">'+
        'oink, oink'+
        '</root>';
    xmldoc = domparser.parseFromString(xmlstring, 'text/xml');

    ok(xmldoc , 'parsed xml document');
    equals(xmldoc.documentElement.tagName, 'root', 'documentElement.tagName');
    equals(xmldoc.documentElement.getAttribute('type'), 'pig', 'documentElement.getAttribute');

});

test('HTMLElement.innerHTML', function(){

    var htmlstring = '<p id="envjs">oink, oink</p>',
    tmp = document.createElement('div'),
    element,
    attribute,
    text;

    ok(tmp.innerHTML = htmlstring, 'parsed html into node');
    equals(tmp.childNodes.length, 1, '.childNodes.length');

    element = tmp.childNodes[0];
    equals(element.attributes.length, 1, '.attributes.length');
    equals(element.tagName, 'P', '.name');
    equals(element.childNodes.length, 1, '.childNodes');
    equals(element.localName, 'P', '.localName');
    equals(element.namespaceURI, null, '.namespaceURI');
    equals(element.nodeName, 'P', '.nodeName');
    equals(element.nodeType, Node.ELEMENT_NODE, 'nodeType');
    equals(element.ownerDocument, document, '.ownerDocument');
    equals(element.parentNode, tmp, '.parentNode');
    equals(element.prefix, null, '.prefix');
    equals(element.tagName, 'P', '.tagName');
    equals(element.toString(), '[object HTMLParagraphElement]', '.toString');
    equals(tmp.innerHTML, '<p id="envjs">oink, oink</p>', '.innerHTML');


    equals(element.id, element.getAttribute('id'), '.id');
    equals(element.id, 'envjs', '.id');

    attribute = element.attributes[0];
    equals(attribute.attributes, null, '.attributes.length');
    //TODO: this is a known failure for Envjs because our
    //      dom doesnt make text nodes for attribute values
    //      FIX ME!!
    //equals(attribute.childNodes.length, 1, '.childNodes');

    equals(attribute.localName, 'id', '.localName');
    equals(attribute.name, 'id', '.name');
    equals(attribute.namespaceURI, null, '.namespaceURI');
    equals(attribute.nodeName, "id", '.nodeName');
    equals(attribute.nodeType, Node.ATTRIBUTE_NODE, '.nodeType');
    equals(attribute.nodeValue, 'envjs', '.nodeValue');
    equals(attribute.ownerDocument, document, '.ownerDocument');
    equals(attribute.parentNode, null, '.parentNode');
    equals(attribute.prefix, null, '.prefix');
    equals(attribute.textContent, 'envjs', '.textContent');
    equals(attribute.value, 'envjs', '.value');

    text = element.childNodes[0];
    equals(text.attributes, null, '.attributes.length');
    equals(text.childNodes.length, 0, '.childNodes.length');
    equals(text.localName, null, '.localName');
    equals(text.namespaceURI, null, '.namespaceURI');
    equals(text.nodeName, "#text", '.nodeName');
    equals(text.nodeType, Node.TEXT_NODE, '.nodeType');
    equals(text.nodeValue, 'oink, oink', '.nodeValue');
    equals(text.ownerDocument, document, '.ownerDocument');
    equals(text.parentNode, element, '.parentNode');
    equals(text.prefix, null, '.prefix');
    equals(text.textContent, 'oink, oink', '.textContent');

});

test('HTMLParser.parseDocument / simple content', function(){
    //one of the easiest way to test the HTMLParser is using frames and
    //writing the document directly
    expect(4);
    var iframe = document.createElement("iframe");
    document.body.appendChild(iframe);
    iframe.addEventListener('load', function(){
        var doc;
        ok(true, 'frame loaded');

        doc = iframe.contentDocument;
        ok(doc, 'frame has contentDocument');
        equals(doc+'', '[object HTMLDocument]', 'doc is HTMLDocument')
        equals(doc.body.innerHTML,'<p id="p1">this is a pig</p>', 'innerHTML');
        document.body.removeChild( iframe );
        start();
    }, false);

    var doc = iframe.contentDocument;
    doc.write("<body><p id='p1'>this is a pig</p></body>");
    doc.close();
    stop();
});

test('HTMLParser.parseDocument / malformed content', function(){
    //one of the easiest way to test the HTMLParser is using frames and
    //writing the document directly
    expect(4);
    var iframe = document.createElement("iframe");
    document.body.appendChild(iframe);

    iframe.addEventListener('load', function(){
        var doc;
        ok(true, 'frame loaded');

        doc = iframe.contentDocument;
        ok(doc, 'frame has contentDocument');
        equals(doc+'', '[object HTMLDocument]', 'doc is HTMLDocument')
        equals(doc.body.innerHTML,'<p id="p1">this is a pig</p>', 'innerHTML');
        document.body.removeChild( iframe );
        start();
    }, false);

    var doc = iframe.contentDocument;
    doc.write("<body><p id='p1'>this is a pig</body>");
    doc.close();
    stop();

});

/**
 * Test that image loading works in various contexts
 *
 */
test('Image Loading', function(){
    var node;
    if ((typeof Envjs == 'undefined') || !Envjs) {
        Envjs = {};
    }

    // This is the callback
    var counter = 0;
    Envjs.loadImage = function() {
        counter += 1;
        return true;
    }

    // Part 1 -- img triggered in normal parsing
    var iframe = document.createElement("iframe");
    document.body.appendChild(iframe);

    iframe.addEventListener('load', function(){
        var doc = iframe.contentDocument;
        ok(true, 'frame loaded');

        // part 1 - continued
        equals(counter, 1, "Image fired in full document parsing");

        // Part 2 -- triggered by using setAttribute
        node = doc.body.firstChild;
        node.setAttribute('src', 'dingbat');
        equals(counter, 2, "Image fired in SetAttribute");
        equals(node.src, 'dingbat');

        // Part 3 -- change the src attribute directly
        node = doc.body.firstChild;
        node.src = 'dingbat2';
        equals(counter, 3, "Image fired by src setter");
        equals(node.src, 'dingbat2');

        // Part 4 -- triggered by using innerHTML
        doc.body.innerHTML = '<img src="dingbat3">';
        equals(counter, 4, "Image fired in inner html");
        node = doc.body.firstChild;
        equals(node.src, 'dingbat3');

        // Part 5 -- check that a "parentless" image fires
        var img = new Image();
        img.src ="dingbat5";
        equals(counter, 5, "Image fired in 'new Image'");
        // TODO check that appendChild does NOT fire

        // appendChild does not fire again (since we fired already)
        doc.body.appendChild(img);
        equals(counter, 5, "appendChild(img) does *not* fire");

        document.body.removeChild(iframe);
        start();
    }, false);

    var doc = iframe.contentDocument;
    doc.write('<html><head></head><body><img src="/foo"></body></html>');
    doc.close();
    stop();
});

/**
 * Test that image loading works in various contexts
 *
 */
test('Link Loading', function(){
    var node;
    if ((typeof Envjs == 'undefined') || !Envjs) {
        Envjs = {};
    }

    // This is the callback
    var counter = 0;
    Envjs.loadLink = function() {
        counter += 1;
        return true;
    }

    // Part 1 -- img triggered in normal parsing
    var iframe = document.createElement("iframe");
    document.body.appendChild(iframe);

    iframe.addEventListener('load', function(){
        var doc = iframe.contentDocument;
        ok(true, 'frame loaded');

        // part 1 - continued
        equals(counter, 1, "Link fired in full document parsing");

        // Part 2 -- triggered by using setAttribute
        node = doc.body.firstChild;
        node.setAttribute('href', 'dingbat');
        equals(counter, 2, "Link fired in SetAttribute");
        equals(node.href, 'dingbat');

        // Part 3 -- change the src attribute directly
        node = doc.body.firstChild;
        node.href = 'dingbat2';
        equals(counter, 3, "Link fired by href setter");
        equals(node.href, 'dingbat2');

        // Part 4 -- triggered by using innerHTML
        doc.body.innerHTML = '<link rel="stylesheet" type="text/css" href="dingbat3">';
        equals(counter, 4, "Link fired in inner html");
        node = doc.body.firstChild;
        equals(node.href, 'dingbat3');

        // Part 5 -- parentless Link does NOT fire
        var newnode = doc.createElement('link');
        newnode.setAttribute('type', 'text/css');
        newnode.setAttribute('rel', 'stylesheet');
        newnode.setAttribute('href', 'dingbat4');
        equals(counter, 4, "Link *not* fired if parentless");

        /*
         * Ok here, the spec falls down - it's not clear what should
         * happen.  Firefox 3.6 does NOT fire an event on appendChild,
         * while Safari/Chrome DOES I went with
         * lower-common-demoninator.
         */
        equals(counter, 4, "Link *not* fired during appendChild");

        document.body.removeChild(iframe);
        start();
    }, false);

    var doc = iframe.contentDocument;
    doc.write('<html><head></head><body><link rel="stylesheet" type="text/css" href="/foo"></body></html>');
    doc.close();
    stop();
});

test('Form Named Element Lookup', function(){
    expect(11);
    if ((typeof Envjs == 'undefined') || !Envjs) {
        Envjs = {};
    }
    var iframe = document.createElement("iframe");
    document.body.appendChild(iframe);

    iframe.addEventListener('load', function(){
        var doc = iframe.contentDocument;
        ok(true, 'frame loaded');
        var form = doc.foo;
        var elements = form.elements;
        ok(elements instanceof HTMLCollection, "form.elements is an HTMLCollection");
        equals(elements.length, 0, "form.elements does not include non-form elements");
        equals(form.length, 0, "form.length is 0");

        // ok now let's try to use innerHTML
        var str = '<form name="bar"><input name="input1"/></form>';
        doc.body.innerHTML = str;
        form = doc.bar;
        ok(form instanceof HTMLFormElement, "form is an HTMLFormElement");
        elements = doc.bar.elements;
        equals(elements.length, 1, 'elements length is 1');
        equals(form.length, 1, 'form length is 1');
        //print('element is : ' + elements.input1);
        ok(elements.input1 instanceof HTMLInputElement, 'is HTMLInputElement');
        ok(form.input1 instanceof HTMLInputElement, 'is HTMLInputElement');

        // let's change the name
        var node = form.input1;
        node.name = 'input2';
        ok(form.input2 instanceof HTMLInputElement, 'is HTMLInputElement');
        ok(form.input1 instanceof HTMLInputElement, 'is HTMLInputElement');

        /*
        // the other one should be zapped
        node2 = doc.foo;
        ok(! node2, 'old named element is gone');
        */
        document.body.removeChild(iframe);
        start();
    }, false);

    var doc = iframe.contentDocument;
    doc.write('<html><head></head><body><form name="foo"><div></div></form></body></html>');
    doc.close();
    stop();
});


function testForm(doc, isenvjs) {
    var form = doc.foo;
    var elements = form.elements;
    ok(elements instanceof HTMLCollection,
       "form.elements is an HTMLCollection");
    equals(elements.length, 6, "form.elements.length");
    equals(form.length, 6, "form.length");


    // not yet supported by FF 3.6
    //equals(form.namedItem('e1').value, 'v1', 'form.namedItem(e1).value');
    //equals(form.item(0).value, 'v1', 'form.item(0).value');

    equals(form.e1.value, 'v1', 'form.e1.value');
    equals(form.e2.value, 'v2', 'form.e2.value');
    equals(form.e3.value, 'v3', 'form.e3.value');
    equals(form.e4.value, 'v4', 'form.e4.value');
    equals(form.e5.value, 'v5', 'form.e5.value');
    equals(form.e6.value, 'v6', 'form.e6.value');

    // quick tests of HTMLCollection
    equals(form.elements.toString(), '[object HTMLCollection]',
           'form.elements.toString()');
    equals(form.elements[1234], null, 'form.elements[12340]');
    equals(form.elements.item(1234), null, 'form.elements.item(12340)');
    equals(form.elements.namedItem('foo'), null, 'form.elements.namedItem(foo)');

    equals(form.elements.e1.value, 'v1', 'form.elements.e1.value');
    equals(form.elements.e2.value, 'v2', 'form.elements.e2.value');
    equals(form.elements.e3.value, 'v3', 'form.elements.e3.value');
    equals(form.elements.e4.value, 'v4', 'form.elements.e4.value');
    equals(form.elements.e5.value, 'v5', 'form.elements.e5.value');
    equals(form.elements.e6.value, 'v6', 'form.elements.e6.value');

    // direct array lookup
    equals(form.elements[0].value, 'v1', 'form.elements[0].value');
    equals(form.elements[1].value, 'v2', 'form.elements[1].value');
    equals(form.elements[2].value, 'v3', 'form.elements[2].value');
    equals(form.elements[3].value, 'v4', 'form.elements[3].value');
    equals(form.elements[4].value, 'v5', 'form.elements[4].value');
    equals(form.elements[5].value, 'v6', 'form.elements[5].value');

    // namedItems
    equals(form.elements.namedItem('e1').value, 'v1',
           'form.elements.namedItem(e1).value');
    equals(form.elements.namedItem('e2').value, 'v2',
           'form.elements.namedItem(e2).value');
    equals(form.elements.namedItem('e3').value, 'v3',
           'form.elements.namedItem(e3).value');
    equals(form.elements.namedItem('e4').value, 'v4',
           'form.elements.namedItem(e4).value');
    equals(form.elements.namedItem('e5').value, 'v5',
           'form.elements.namedItem(e5).value');
    equals(form.elements.namedItem('e6').value, 'v6',
           'form.elements.namedItem(e6).value');


    // items
    equals(form.elements.item(0).value, 'v1',
           'form.elements.item(e1).value');
    equals(form.elements.item(1).value, 'v2',
           'form.elements.item(e2).value');
    equals(form.elements.item(2).value, 'v3',
           'form.elements.item(e3).value');
    equals(form.elements.item(3).value, 'v4',
           'form.elements.item(e4).value');
    equals(form.elements.item(4).value, 'v5',
           'form.elements.item(e5).value');
    equals(form.elements.item(5).value, 'v6',
           'form.elements.item(e6).value');

    // Options
    equals(form.e5[0].value, 'v5', 'form.e5[0]');
    equals(form.e5[1].value, 'opt2', 'form.e5[1]');


    equals(form.e5.item(0).value, 'v5', 'form.e5.item(0)');
    equals(form.e5.item(1).value, 'opt2', 'form.e5.item(1)');


    equals(form.e5.options.length, 2, 'form.e5.options.length');
    equals(form.e5.options[0].value, 'v5', 'form.e5.options[0].value');
    equals(form.e5.options[1].value, 'opt2', 'form.e5.options[1].value');
    equals(form.e5.options.item(0).value, 'v5', 'form.e5.options[0].value');
    equals(form.e5.options.item(1).value, 'opt2', 'form.e5.options[1].value');

    // test the option.index
    equals(form.e5.options[0].index, 0, 'form.e5.options[0].index');
    equals(form.e5.options[1].index, 1, 'form.e5.options[1].index');

    // firefox bugs or incomplete behavior
    // some of these run under the doc and innerHTML tests, but
    // don't work under the DOMAPI test
    if (isenvjs) {
        equals(form.e5.options.namedItem('o1').value, 'v5', 'form.e5.options[0].value');
        equals(form.e5.options.namedItem('o2').value, 'opt2', 'form.e5.options[1].value');
        equals(form.e5['o1'].value, 'v5', 'form.e5[0]');
        equals(form.e5['o2'].value, 'opt2', 'form.e5[1]');

        equals(form.e5.namedItem('o1').value, 'v5', 'form.e5.namedItem(o1)');
        equals(form.e5.namedItem('o2').value, 'opt2', 'form.e5.namedItem(o2)');
    }


}



test('Form Named Elements via parser', function() {
    if ((typeof Envjs == 'undefined') || !Envjs) {
        Envjs = {};
    }

    // need to do this at top level since under FF,
    //  frames have different scope and this function isn't defined.
    var iframe = document.createElement("iframe");
    document.body.appendChild(iframe);

    iframe.addEventListener('load', function() {
        var doc = iframe.contentDocument;
        ok(true, 'frame loaded');
        testForm(doc, isenvjs);
        document.body.removeChild(iframe);
        start();
    }, false);

    var doc = iframe.contentDocument;
    doc.write('<html><head></head><body><form name="foo">' +
              '<div></div>' + // non-form element
              '<input name="e1" value="v1" />'  + // input element
              '<input id="e2" value="v2" />'    + // input element
              '<textarea name="e3">v3</textarea>' + // text area
              '<textarea id="e4">v4</textarea>' + // text area
              '<select name="e5">' + //
              '<option name="o1" selected>v5</option>' +
              '<option id="o2">opt2</option>' +
              '</select>' +
              '<button name="e6" value="v6" />' +
              '</form></body></html>');
    doc.close();
    stop();
});

test('Form Named Elements via innerHTML', function() {
    if ((typeof Envjs == 'undefined') || !Envjs) {
        Envjs = {};
    }
    var iframe = document.createElement("iframe");
    document.body.appendChild(iframe);

    iframe.addEventListener('load', function() {
        var doc = iframe.contentDocument;
        ok(true, 'frame loaded');
        var div = doc.getElementById('container');
        div.innerHTML = '' +
            '<form name="foo">' +
            '<div></div>' + // non-form element
            '<input name="e1" value="v1" />'  + // input element
            '<input id="e2" value="v2" />'    + // input element
            '<textarea name="e3">v3</textarea>' + // text area
            '<textarea id="e4">v4</textarea>' + // text area
            '<select name="e5">' + //
            '<option name="o1" selected>v5</option>' +
            '<option id="o2">opt2</option>' +
            '</select>' +
            '<button name="e6" value="v6" />' +
            '</form>';
        testForm(doc, isenvjs);
        document.body.removeChild(iframe);
        start();
    }, false);

    var doc = iframe.contentDocument;
    doc.write('<html><head></head><body><div id="container">' +
              '</div</body></html>');
    doc.close();
    stop();
});

test('Form Named Elements via DOMAPI', function() {
    if ((typeof Envjs == 'undefined') || !Envjs) {
        Envjs = {};
    }
    var iframe = document.createElement("iframe");
    document.body.appendChild(iframe);

    iframe.addEventListener('load', function() {
        var doc = iframe.contentDocument;
        ok(true, 'frame loaded');
        var div = doc.getElementById('container');
        var form = doc.createElement('form');
        var n;
        form.name = 'foo';
        div.appendChild(form);

        n = doc.createElement('input');
        n.name = 'e1';
        n.value = 'v1';
        form.appendChild(n);

        n = doc.createElement('input');
        n.id = 'e2';
        n.value = 'v2';
        form.appendChild(n);

        n = doc.createElement('textarea');
        n.name = 'e3';
        n.value = 'v3';
        form.appendChild(n);

        n = doc.createElement('textarea');
        n.id = 'e4';
        n.value = 'v4';
        form.appendChild(n);
        lastn = n;

        var select = doc.createElement('select');
        select.name = 'e5';
        form.appendChild(select);

        var opt = new Option('v5', 'v5', true, true);
        opt.name ='o1';
        select.add(opt, null);
        //       select.appendChild(opt);

        opt = new Option('opt2', 'opt2');
        opt.id = 'o2';
        select.add(opt, null);
        //select.appendChild(opt);

        n = doc.createElement('button');
        n.name = 'e6';
        n.value = 'v6';
        form.appendChild(n);

        testForm(doc, isenvjs);
        document.body.removeChild(iframe);
        start();
    }, false);

    var doc = iframe.contentDocument;
    doc.write('<html><head></head><body><div id="container">' +
              '</div</body></html>');
    doc.close();
    stop();
});
