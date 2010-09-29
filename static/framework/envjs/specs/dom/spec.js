QUnit.module('DOM Level 3');//A little ambitious but we are on the way

test('DOM Interfaces Available', function(){

    expect(20);
    ok(Attr,                    'Attr defined');
    ok(CDATASection,            'CDATASection defined');
    ok(CharacterData,           'CharacterData defined');
    ok(Comment,                 'Comment defined');
    ok(Document,                'Document defined');
    ok(DocumentFragment,        'DocumentFragment defined');
    ok(DocumentType,            'DocumentType defined');
    ok(DOMException,            'DOMException defined');
    ok(DOMImplementation,       'DOMImplementation defined');
    ok(Element,                 'Element defined');
    ok(Entity,                  'Entity defined');
    ok(EntityReference,         'EntityReference defined');
    ok(NamedNodeMap,            'NamedNodeMap defined');
    ok(Namespace,               'Namespace defined');
    ok(Node,                    'Node defined');
    ok(NodeList,                'NodeList defined');
    ok(Notation,                'Notation defined');
    ok(ProcessingInstruction,   'ProcessingInstruction defined');
    ok(Text,                    'Text defined');
    ok(XMLSerializer,           'XMLSerializer defined');
});

// mock the global document object if not available
try{
    document;
}catch(e){
    document = new Document(new DOMImplementation());
}
var xmlserializer = new XMLSerializer();

QUnit.module('DOMImplementation');

test('createDocument', function(){

    var doc;

    doc = document.implementation.createDocument('http://www.envjs.com', 'envjs', null);
    ok(doc, 'doc created');
    equals(doc.toString(), '[object XMLDocument]', '.toString()');
    equals(doc.attributes, null, '.attributes');
    equals(doc.childNodes.length, 1, 'childNodes.length');
    equals(doc.documentElement.tagName, 'envjs', '.documentElement.tagName');
    equals(doc.documentElement.namespaceURI, 'http://www.envjs.com', '.documentElement.namespaceURI');

    doc = document.implementation.createDocument(null, 'html', null);
    ok(doc, 'doc created');
    equals(doc.toString(), '[object XMLDocument]', '.toString()');
    equals(doc.attributes, null, '.attributes');
    equals(doc.documentElement.tagName, 'html', '.documentElement.tagName');
    equals(doc.documentElement.namespaceURI, null, '.documentElement.namespaceURI');

    doc = document.implementation.createDocument('', 'html', null);
    ok(doc, 'doc created');
    equals(doc.toString(), '[object XMLDocument]', '.toString()');
    equals(doc.attributes, null, '.attributes');
    equals(doc.documentElement.tagName, 'html', '.documentElement.tagName');
    equals(doc.documentElement.namespaceURI, null, '.documentElement.namespaceURI');

    doc = document.implementation.createDocument('http://www.w3.org/1999/xhtml', 'html', null);
    ok(doc, 'doc created');
    equals(doc.toString(), '[object XMLDocument]', '.toString()');
    equals(doc.attributes, null, '.attributes');
    equals(doc.documentElement.tagName, 'html', '.documentElement.tagName');
    equals(doc.documentElement.namespaceURI, 'http://www.w3.org/1999/xhtml', '.documentElement.namespaceURI');

    var htmldoctype;

    htmldoctype = document.implementation.createDocumentType('html', null, null);
    doc = document.implementation.createDocument(null, 'html', htmldoctype);
    ok(doc, 'doc created');
    equals(doc.toString(), '[object XMLDocument]', '.toString()');
    equals(doc.attributes, null, '.attributes');
    equals(doc.documentElement.tagName, 'html', '.documentElement.tagName');
    equals(doc.documentElement.namespaceURI, null, '.documentElement.namespaceURI');


    htmldoctype = document.implementation.createDocumentType('html', null, "-//W3C//DTD HTML 3.2 Final//EN");
    doc = document.implementation.createDocument(null, 'html', htmldoctype);
    ok(doc, 'doc created');
    equals(doc.toString(), '[object XMLDocument]', '.toString()');
    equals(doc.attributes, null, '.attributes');
    equals(doc.documentElement.tagName, 'html', '.documentElement.tagName');
    equals(doc.documentElement.namespaceURI, null, '.documentElement.namespaceURI');


    htmldoctype = document.implementation.createDocumentType('html', null, "-//W3C//DTD HTML 4.01//EN");
    doc = document.implementation.createDocument(null, 'html', htmldoctype);
    ok(doc, 'doc created');
    equals(doc.toString(), '[object XMLDocument]', '.toString()');
    equals(doc.attributes, null, '.attributes');
    equals(doc.documentElement.tagName, 'html', '.documentElement.tagName');
    equals(doc.documentElement.namespaceURI, null, '.documentElement.namespaceURI');

});

QUnit.module('Document');

test('location', function(){

    var doc;

    doc = document.implementation.createDocument('http://www.envjs.com', 'envjs', null);
    ok(doc, 'doc created');
    equals(doc.baseURI, 'about:blank', '.baseURI');
    equals(doc.documentURI, 'about:blank', '.documentURI');

    equals(doc.baseURI, 'about:blank', '.baseURI');
    equals(doc.documentURI, 'about:blank', '.documentURI');

});

test('createElement', function(){

    var doc,
        element;

    doc = document.implementation.createDocument('', '', null);
    element = doc.createElement('envjs');

    ok(element, 'element created');
    equals(element.attributes.length, 0, '.attributes.length');
    equals(element.tagName, 'envjs', '.name');
    equals(element.childNodes.length, 0, '.childNodes');
    equals(element.localName, 'envjs', '.localName');
    equals(element.namespaceURI, null, '.namespaceURI');
    equals(element.nodeName, 'envjs', '.nodeName');
    equals(element.nodeType, Node.ELEMENT_NODE, 'nodeType');
    equals(element.ownerDocument, doc, '.ownerDocument');
    equals(element.parentNode, null, '.parentNode');
    equals(element.prefix, null, '.prefix');
    equals(element.toString(), '[object Element]', '.toString');
    equals(xmlserializer.serializeToString(element), '<envjs/>', 'xmlserializer');


});

test('createElementNS', function(){

    var doc,
        element;

    doc = document.implementation.createDocument('', '', null);
    element = doc.createElementNS('http://www.envjs.com/','x:envjs');

    ok(element, 'element created');
    equals(element.attributes.length, 0, '.attributes.length');
    equals(element.tagName, 'x:envjs', '.tagName');
    equals(element.childNodes.length, 0, '.childNodes');
    equals(element.localName, 'envjs', '.localName');
    equals(element.namespaceURI, "http://www.envjs.com/", '.namespaceURI');
    equals(element.nodeName, 'x:envjs', '.nodeName');
    equals(element.nodeType, Node.ELEMENT_NODE, 'nodeType');
    equals(element.ownerDocument, doc, '.ownerDocument');
    equals(element.parentNode, null, '.parentNode');
    equals(element.prefix, 'x', '.prefix');
    equals(element.toString(), '[object Element]', '.toString');
    equals(xmlserializer.serializeToString(element), '<x:envjs xmlns:x="http://www.envjs.com/"/>', 'xmlserializer');

    ok(element.prefix = 'y', 'set prefix');
    equals(element.prefix, 'y', '.prefix');
    equals(element.tagName, 'y:envjs', '.tagName');
    equals(xmlserializer.serializeToString(element), '<y:envjs xmlns:y="http://www.envjs.com/"/>', 'xmlserializer');

    element.prefix = null;
    equals(element.prefix, null, '.prefix');
    equals(element.tagName, 'envjs', '.tagName');
    equals(xmlserializer.serializeToString(element), '<envjs xmlns="http://www.envjs.com/"/>', 'xmlserializer');

});



test('createAttribute', function(){

    var doc,
        attribute;

    doc = document.implementation.createDocument('', '', null);
    attribute = doc.createAttribute('envjs');

    ok(attribute, 'attribute created');
    equals(attribute.attributes, null, '.attributes');
    equals(attribute.name, 'envjs', '.name');
    equals(attribute.value, '', '.value');
    equals(attribute.specified, true, '.specified');
    equals(attribute.ownerElement, null, '.ownerElement');
    equals(attribute.childNodes.length, 0, '.childNodes');
    equals(attribute.localName, 'envjs', '.localName');
    equals(attribute.namespaceURI, null, '.namespaceURI');
    equals(attribute.nodeName, 'envjs', '.nodeName');
    equals(attribute.nodeType, Node.ATTRIBUTE_NODE, 'nodeType');
    equals(attribute.ownerDocument, doc, '.ownerDocument');
    equals(attribute.parentNode, null, '.parentNode');
    equals(attribute.prefix, null, '.prefix');
    ok(attribute.value = 'abc123', 'set value');
    equals(attribute.value, 'abc123', '.value');
    equals(attribute.name, 'envjs', '.name');
    equals(attribute.toString(), '[object Attr]', '.toString');
    equals(xmlserializer.serializeToString(attribute), 'abc123', 'xmlserializer');

});

test('createAttributeNS', function(){

    var doc,
        attribute;

    doc = document.implementation.createDocument('', '', null);
    attribute = doc.createAttributeNS('http://www.envjs.com/','x:envjs');

    ok(attribute, 'namespaced attribute was created');
    //equals(attribute.isId, false, '.isId');
    equals(attribute.attributes, null, '.attributes');
    //equals(attribute.baseURI, "", '.baseURI');
    equals(attribute.childNodes.length, 0, '.childNodes');
    equals(attribute.localName, 'envjs', '.localName');
    equals(attribute.name, 'x:envjs', '.name');
    equals(attribute.nodeName, 'x:envjs', '.nodeName');
    equals(attribute.nodeType, Node.ATTRIBUTE_NODE, 'nodeType');
    equals(attribute.nodeValue, '', 'nodeValue');
    equals(attribute.ownerDocument, doc, '.ownerDocument');
    equals(attribute.ownerElement, null, '.ownerElement');
    equals(attribute.namespaceURI, 'http://www.envjs.com/', '.namespaceURI');
    equals(attribute.parentNode, null, '.parentNode');
    equals(attribute.prefix, 'x', '.prefix');
    equals(attribute.specified, true, '.specified');
    equals(attribute.textContent, '', '.textContent');
    equals(attribute.value, '', '.value');

    ok(attribute.value = 'abc123', 'set value');
    equals(attribute.value, 'abc123', '.value');

    ok(attribute.prefix = 'y', 'set prefix');
    equals(attribute.prefix, 'y', '.prefix');
    equals(attribute.name, 'y:envjs', '.name');
    equals(attribute.toString(), '[object Attr]', '.toString');
    equals(xmlserializer.serializeToString(attribute), 'abc123', 'xmlserializer');


    attribute = doc.createAttributeNS('http://www.envjs.com/','envjs');

    ok(attribute, 'namespaced attribute was created');
    equals(attribute.attributes, null, '.attributes');
    equals(attribute.name, 'envjs', '.name');
    equals(attribute.value, '', '.value');
    equals(attribute.specified, true, '.specified');
    equals(attribute.ownerElement, null, '.ownerElement');
    equals(attribute.childNodes.length, 0, '.childNodes');
    equals(attribute.localName, 'envjs', '.localName');
    equals(attribute.namespaceURI, 'http://www.envjs.com/', '.namespaceURI');
    equals(attribute.nodeName, 'envjs', '.nodeName');
    equals(attribute.nodeType, Node.ATTRIBUTE_NODE, 'nodeType');
    equals(attribute.ownerDocument, doc, '.ownerDocument');
    equals(attribute.parentNode, null, '.parentNode');
    equals(attribute.prefix, null, '.prefix');

    attribute = doc.createAttributeNS('','envjs');

    ok(attribute, 'namespaced attribute was created');
    equals(attribute.attributes, null, '.attributes');
    equals(attribute.name, 'envjs', '.name');
    equals(attribute.value, '', '.value');
    equals(attribute.specified, true, '.specified');
    equals(attribute.ownerElement, null, '.ownerElement');
    equals(attribute.childNodes.length, 0, '.childNodes');
    equals(attribute.localName, 'envjs', '.localName');
    equals(attribute.namespaceURI, null, '.namespaceURI');
    equals(attribute.nodeName, 'envjs', '.nodeName');
    equals(attribute.nodeType, Node.ATTRIBUTE_NODE, 'nodeType');
    equals(attribute.ownerDocument, doc, '.ownerDocument');
    equals(attribute.parentNode, null, '.parentNode');
    equals(attribute.prefix, null, '.prefix');
});

test('createTextNode', function(){

    var doc,
        text,
        keyboardish=''+
        '`1234567890-='+
        '\tqwertyuiop[]\\'+
        'asdfghjkl;\'\n'+
        'zxcvbnm,./'+
        ' '+
        '~!@#$%^&*()_+'+
        '\tQWERTYUIOP{}|'+
        'ASDFGHJKL:"\n'+
        'ZXCVBNM<>?'+
        ' ';

    doc = document.implementation.createDocument('', '', null);
    text = doc.createTextNode(keyboardish);

    ok(text, 'text node was created');
    equals(text.attributes, null, '.attributes');
    equals(text.baseURI, 'about:blank', '.baseURI');
    equals(text.childNodes.length, 0, '.childNodes');
    equals(text.data, keyboardish, '.data');
    equals(text.length, 100, '.length');
    equals(text.localName, null, '.localName');
    equals(text.namespaceURI, null, '.namespaceURI');
    equals(text.nodeName, '#text', '.nodeName');
    equals(text.nodeType, Node.TEXT_NODE, 'nodeType');
    equals(text.nodeValue, keyboardish, '.nodeValue');
    equals(text.ownerDocument, doc, '.ownerDocument');
    equals(text.parentNode, null, '.parentNode');
    equals(text.prefix, null, '.prefix');
    equals(text.textContent, keyboardish, '.textContent');
});

test('createComment', function(){

    var doc,
        comment,
        keyboardish=''+
        '`1234567890-='+
        '\tqwertyuiop[]\\'+
        'asdfghjkl;\'\n'+
        'zxcvbnm,./'+
        ' '+
        '~!@#$%^&*()_+'+
        '\tQWERTYUIOP{}|'+
        'ASDFGHJKL:"\n'+
        'ZXCVBNM<>?'+
        ' ';

    doc = document.implementation.createDocument('', '', null);
    comment = doc.createComment(keyboardish);

    ok(comment, 'node was created');
    equals(comment.attributes, null, '.attributes');
    equals(comment.baseURI, 'about:blank', '.baseURI');
    equals(comment.childNodes.length, 0, '.childNodes');
    equals(comment.data, keyboardish, '.data');
    equals(comment.length, 100, '.length');
    equals(comment.localName, null, '.localName');
    equals(comment.namespaceURI, null, '.namespaceURI');
    equals(comment.nodeName, '#comment', '.nodeName');
    equals(comment.nodeType, Node.COMMENT_NODE, 'nodeType');
    equals(comment.nodeValue, keyboardish, '.nodeValue');
    equals(comment.ownerDocument, doc, '.ownerDocument');
    equals(comment.parentNode, null, '.parentNode');
    equals(comment.prefix, null, '.prefix');
    equals(comment.textContent, keyboardish, '.textContent');

});

test('createCDATASection', function(){

    var doc,
        cdata,
        keyboardish=''+
        '`1234567890-='+
        '\tqwertyuiop[]\\'+
        'asdfghjkl;\'\n'+
        'zxcvbnm,./'+
        ' '+
        '~!@#$%^&*()_+'+
        '\tQWERTYUIOP{}|'+
        'ASDFGHJKL:"\n'+
        'ZXCVBNM<>?'+
        ' ';

    doc = document.implementation.createDocument('', '', null);
    cdata = doc.createCDATASection(keyboardish);

    ok(cdata, 'node was created');
    equals(cdata.attributes, null, '.attributes');
    equals(cdata.baseURI, 'about:blank', '.baseURI');
    equals(cdata.childNodes.length, 0, '.childNodes');
    equals(cdata.data, keyboardish, '.data');
    equals(cdata.length, 100, '.length');
    equals(cdata.localName, null, '.localName');
    equals(cdata.namespaceURI, null, '.namespaceURI');
    equals(cdata.nodeName, '#cdata-section', '.nodeName');
    equals(cdata.nodeType, Node.CDATA_SECTION_NODE, 'nodeType');
    equals(cdata.nodeValue, keyboardish, '.nodeValue');
    equals(cdata.ownerDocument, doc, '.ownerDocument');
    equals(cdata.parentNode, null, '.parentNode');
    equals(cdata.prefix, null, '.prefix');
    equals(cdata.textContent, keyboardish, '.textContent');
    equals(xmlserializer.serializeToString(cdata),
        "<![CDATA["+keyboardish+"]]>", 'serializeToString');

});

test('createProcessingInstruction', function(){

    var doc,
        pi,
        target = 'foo',
        data = 'bar="pooh"';
        //seriously i never use pi's--is there a better example

    doc = document.implementation.createDocument('', '', null);
    pi = doc.createProcessingInstruction(target, data);

    ok(pi, 'node was created');
    equals(pi.attributes, null, '.attributes');
    equals(pi.baseURI, 'about:blank', '.baseURI');
    equals(pi.childNodes.length, 0, '.childNodes');
    equals(pi.data, data, '.data');
    equals(pi.localName, null, '.localName');
    equals(pi.namespaceURI, null, '.namespaceURI');
    equals(pi.nodeName, target, '.nodeName');
    equals(pi.nodeType, Node.PROCESSING_INSTRUCTION_NODE, 'nodeType');
    equals(pi.nodeValue, data, '.nodeValue');
    equals(pi.ownerDocument, doc, '.ownerDocument');
    equals(pi.parentNode, null, '.parentNode');
    equals(pi.prefix, null, '.prefix');
    equals(pi.textContent, data, '.textContent');
    equals(xmlserializer.serializeToString(pi),
         '<'+'?foo bar="pooh"?>', '.serializeToString');
});

test('createDocumentFragment', function(){

    var doc,
        fragment;

    doc = document.implementation.createDocument('', '', null);
    fragment = doc.createDocumentFragment();

    ok(fragment, 'fragment');
    //pending implementation in Envjs
    //ok(fragment.querySelector, '.querySelector');
    //ok(fragment.querySelectorAll, '.querySelectorAll');
    equals(fragment.attributes, null, '.attributes');
    equals(fragment.baseURI, 'about:blank', '.baseURI');
    ok(fragment.childNodes,  '.childNodes');
    equals(fragment.childNodes.length, 0, '.childNodes.length');
    equals(fragment.firstChild, null, '.firstChild');
    equals(fragment.lastChild, null, '.lastChild');
    equals(fragment.localName, null, '.localName');
    equals(fragment.namespaceURI, null, '.namespaceURI');
    equals(fragment.nextSibling, null, '.nextSibling');
    equals(fragment.nodeName, '#document-fragment', '.nodeName');
    equals(fragment.nodeType, 11, '.nodeType');
    equals(fragment.nodeValue, null, '.nodeValue');
    equals(fragment.ownerDocument, doc, '.ownerDocument');
    equals(fragment.parentNode, null, '.parentNode');
    equals(fragment.prefix, null, '.prefix');
    equals(fragment.previousSibling, null, '.previousSibling');
    equals(fragment.textContent, "", '.textContent');
    equals(xmlserializer.serializeToString(fragment),
        "", 'serializeToString');


});


test('createComment', function(){

    var doc,
        comment;

    doc = document.implementation.createDocument('', '', null);
    comment = doc.createComment("This is a pig, 'oink, oink'");

    ok(comment, 'comment');
    equals(comment.data, "This is a pig, 'oink, oink'", '.data');
    equals(comment.length, 27, '.length');
    ok(comment.appendData,  '.appendData');
    ok(comment.deleteData,  '.deleteData');
    ok(comment.insertData,  '.insertData');
    ok(comment.replaceData,  '.replaceData');
    ok(comment.substringData,  '.substringData');
    equals(comment.attributes, null, '.attributes');
    equals(comment.baseURI, 'about:blank', '.baseURI');
    ok(comment.childNodes,  '.childNodes');
    equals(comment.childNodes.length, 0, '.childNodes.length');
    equals(comment.firstChild, null, '.firstChild');
    equals(comment.lastChild, null, '.lastChild');
    equals(comment.localName, null, '.localName');
    equals(comment.namespaceURI, null, '.namespaceURI');
    equals(comment.nextSibling, null, '.nextSibling');
    equals(comment.nodeName, '#comment', '.nodeName');
    equals(comment.nodeType, 8, '.nodeType');
    equals(comment.nodeValue, "This is a pig, 'oink, oink'", '.nodeValue');
    equals(comment.ownerDocument, doc, '.ownerDocument');
    equals(comment.parentNode, null, '.parentNode');
    equals(comment.prefix, null, '.prefix');
    equals(comment.previousSibling, null, '.previousSibling');
    equals(comment.textContent, "This is a pig, 'oink, oink'", '.textContent');
    equals(xmlserializer.serializeToString(comment),
        "<!--This is a pig, 'oink, oink'-->", 'serializeToString');
});

QUnit.module('Element');

test('attributes', function(){

    var doc,
        element;

    doc = document.implementation.createDocument('', '', null);
    element = doc.createElement('envjs');
    equals(element.attributes.length, 0, '.attributes.length');

    element.setAttribute('animal', 'pig');
    //console.log('dom-spec setAttribute done');
    equals(element.attributes.length, 1, '.attributes.length');
    //console.log('dom-spec attributes.length');
    equals(element.attributes.animal.value, 'pig', 'element.attributes.animal');
    //console.log('dom-spec attributes.getNamedItem');
    equals(element.attributes.getNamedItem('animal').value, 'pig', 'element.attributes.getNamedItem');
});

test('setAttributeNS', function(){

    var doc,
        element;

    doc = document.implementation.createDocument('', '', null);
    element = doc.createElementNS('','envjs');
    equals(element.attributes.length, 0, '.attributes.length');

    element.setAttributeNS('', 'type', 'animal');
    equals(element.attributes.length, 1, 'set attribute');

});

QUnit.module('DocumentFragment');

test('cloneNode', function(){

    var doc,
        fragment,
        elementA,
        elementB;

    doc = document.implementation.createDocument('', '', null);
    fragment = doc.createDocumentFragment();
    elementA = doc.createElement('elementA');
    elementB = doc.createElement('elementB');
    elementA.textContent = "abc";
    elementB.textContent = "def";
    fragment.appendChild(elementA);
    fragment.appendChild(elementB);

    ok(fragment.childNodes,  '.childNodes');
    equals(fragment.childNodes.length, 2, '.childNodes.length');
    equals(fragment.firstChild, elementA, '.firstChild');
    equals(fragment.lastChild, elementB, '.lastChild');
    equals(fragment.localName, null, '.localName');
    equals(fragment.namespaceURI, null, '.namespaceURI');
    equals(fragment.nextSibling, null, '.nextSibling');
    equals(fragment.nodeName, '#document-fragment', '.nodeName');
    equals(fragment.nodeType, 11, '.nodeType');
    equals(fragment.nodeValue, null, '.nodeValue');
    equals(fragment.ownerDocument, doc, '.ownerDocument');
    equals(fragment.parentNode, null, '.parentNode');
    equals(fragment.prefix, null, '.prefix');
    equals(fragment.previousSibling, null, '.previousSibling');
    equals(fragment.textContent, "abcdef", '.textContent');
    equals(xmlserializer.serializeToString(fragment),
        "<elementA>abc</elementA><elementB>def</elementB>", 'serializeToString');

    var clone = fragment.cloneNode(false);//shallow

    ok(clone, 'clone');
    ok(clone.childNodes,  '.childNodes');
    equals(clone.childNodes.length, 0, '.childNodes.length');
    equals(clone.localName, null, '.localName');
    equals(clone.namespaceURI, null, '.namespaceURI');
    equals(clone.nextSibling, null, '.nextSibling');
    equals(clone.nodeName, '#document-fragment', '.nodeName');
    equals(clone.nodeType, 11, '.nodeType');
    equals(clone.nodeValue, null, '.nodeValue');
    equals(clone.ownerDocument, doc, '.ownerDocument');
    equals(clone.parentNode, null, '.parentNode');
    equals(clone.prefix, null, '.prefix');
    equals(clone.previousSibling, null, '.previousSibling');
    equals(clone.textContent, "", '.textContent');
    equals(xmlserializer.serializeToString(clone),
        "", 'serializeToString');


    clone = fragment.cloneNode(true);//deep

    ok(clone, 'clone');
    ok(clone.childNodes,  '.childNodes');
    equals(clone.childNodes.length, 2, '.childNodes.length');
    equals(clone.firstChild.tagName, 'elementA', '.firstChild');
    equals(clone.lastChild.tagName, 'elementB', '.lastChild');
    ok(clone.firstChild !== elementA, 'clone.firstChild !== elementA');
    ok(clone.lastChild !== elementB, 'clone.lastChild !== elementB');
    equals(clone.localName, null, '.localName');
    equals(clone.namespaceURI, null, '.namespaceURI');
    equals(clone.nextSibling, null, '.nextSibling');
    equals(clone.nodeName, '#document-fragment', '.nodeName');
    equals(clone.nodeType, 11, '.nodeType');
    equals(clone.nodeValue, null, '.nodeValue');
    equals(clone.ownerDocument, doc, '.ownerDocument');
    equals(clone.parentNode, null, '.parentNode');
    equals(clone.prefix, null, '.prefix');
    equals(clone.previousSibling, null, '.previousSibling');
    equals(clone.textContent, "abcdef", '.textContent');
    equals(xmlserializer.serializeToString(clone),
        "<elementA>abc</elementA><elementB>def</elementB>", 'serializeToString');

});

test('compareDocumentPosition', function(){

     var docX,
         docY,
         a, b, c;

    docX = document.implementation.createDocument('', 'elementX', null);
    docY = document.implementation.createDocument('', 'elementY', null);
    a = docX.createElement('elementA');
    b = docX.createElement('elementB');
    c = docX.createElement('elementC');
    b.textContent = "def";
    docX.documentElement.appendChild(a);
    docX.documentElement.appendChild(b);
    a.appendChild(c);

    equals(a.compareDocumentPosition(a), 0,
        'DOCUMENT_POSITION_EQUAL');
    equals(b.compareDocumentPosition(a), Node.DOCUMENT_POSITION_PRECEDING,
        'DOCUMENT_POSITION_FOLLOWING');
    equals(a.compareDocumentPosition(b), Node.DOCUMENT_POSITION_FOLLOWING,
        'DOCUMENT_POSITION_PRECEDING');
    equals(c.compareDocumentPosition(a), Node.DOCUMENT_POSITION_CONTAINS|Node.DOCUMENT_POSITION_PRECEDING,
        'DOCUMENT_POSITION_CONTAINED_BY');
    equals(a.compareDocumentPosition(c), Node.DOCUMENT_POSITION_CONTAINED_BY|Node.DOCUMENT_POSITION_FOLLOWING,
        'DOCUMENT_POSITION_CONTAINS');
    equals(b.compareDocumentPosition(c), Node.DOCUMENT_POSITION_PRECEDING,
        'DOCUMENT_POSITION_DISCONNECTED');
    ok(a.compareDocumentPosition(docY.documentElement) > 32,
        'DOCUMENT_POSITION_OUTSIDE');

});

var domparser = new DOMParser();

QUnit.module('DOMParser');

test('parseFromString', function(){

    var root,
        doc;

    /**
     * elements
     */
    doc = domparser.parseFromString(
        '<farm><pig><oink/></pig><cow/><horse/></farm>', 'text/xml');
    root = doc.documentElement;
    equals(root.nodeName, 'farm', 'root.nodeName');
    equals(xmlserializer.serializeToString(root),
        '<farm><pig><oink/></pig><cow/><horse/></farm>', 'serializeToString');


    /**
     * elements ns
     */
    doc = domparser.parseFromString(
        '<farm><pig xmlns="http://oink"><oink/></pig><cow/><horse/></farm>', 'text/xml');
    root = doc.documentElement;
    equals(root.nodeName, 'farm', 'root.nodeName');
    equals(xmlserializer.serializeToString(root),
        '<farm><pig xmlns="http://oink"><oink/></pig><cow/><horse/></farm>', 'serializeToString');


    doc = domparser.parseFromString(
        '<farm xmlns:oink="http://oink"><oink:pig>true</oink:pig><cow/><horse/></farm>', 'text/xml');
    root = doc.documentElement;
    equals(root.nodeName, 'farm', 'root.nodeName');
    //NOTE: known issue with using e4x as it will remove the prefix and add xmlns='http://oink'
    //to the pig <farm xmlns:oink="http://oink"><pig xmlns="http://oink">true</pig><cow/><horse/></farm>
    //equals(xmlserializer.serializeToString(root),
    //    '<farm xmlns:oink="http://oink"><oink:pig>true</oink:pig><cow/><horse/></farm>', 'serializeToString');

    /**
     * attribute
     */
    doc = domparser.parseFromString(
        '<farm sound="oink"><pig/><cow/><horse/></farm>', 'text/xml');
    root = doc.documentElement;
    equals(root.nodeName, 'farm', 'root.nodeName');
    ok(root.hasAttribute('sound'), 'hasAttribute');
    equals(xmlserializer.serializeToString(root),
        '<farm sound="oink"><pig/><cow/><horse/></farm>', 'serializeToString');


    /**
     * attribute ns
     */
    doc = domparser.parseFromString(
        '<farm xmlns:a="abc" a:sound="oink"><pig/><cow/><horse/></farm>', 'text/xml');
    root = doc.documentElement;
    equals(root.nodeName, 'farm', 'root.nodeName');
    equals(xmlserializer.serializeToString(root),
        '<farm xmlns:a="abc" a:sound="oink"><pig/><cow/><horse/></farm>', 'serializeToString');


    /**
     * e4x special characters {} (not evaluated outside XML literals)
     */
    doc = domparser.parseFromString(
        '<farm sound="oink"><pig/>{abc.123}<cow/><horse/></farm>', 'text/xml');
    root = doc.documentElement;
    equals(root.nodeName, 'farm', 'root.nodeName');
    equals(xmlserializer.serializeToString(root),
        '<farm sound="oink"><pig/>{abc.123}<cow/><horse/></farm>', 'serializeToString');

    /**
     * text
     */
    doc = domparser.parseFromString(
        '<farm sound="oink"><pig/><cow>moo</cow><horse/></farm>', 'text/xml');
    root = doc.documentElement;
    equals(root.nodeName, 'farm', 'root.nodeName');
    equals(xmlserializer.serializeToString(root),
        '<farm sound="oink"><pig/><cow>moo</cow><horse/></farm>', 'serializeToString');


    /**
     * comment
     */
    doc = domparser.parseFromString(
        '<farm sound="oink"><pig/><cow>moo</cow><horse/><!-- farmer --></farm>', 'text/xml');
    root = doc.documentElement;
    equals(root.nodeName, 'farm', 'root.nodeName');
    equals(xmlserializer.serializeToString(root),
        '<farm sound="oink"><pig/><cow>moo</cow><horse/><!-- farmer --></farm>', 'serializeToString');

    /**
     * processing-instruction
     */
    doc = domparser.parseFromString(
        '<farm sound="oink"><pig/><cow>moo</cow><horse/><'+'?farmer hadA="duck"?></farm>', 'text/xml');
    root = doc.documentElement;
    equals(root.nodeName, 'farm', 'root.nodeName');
    equals(xmlserializer.serializeToString(root),
        '<farm sound="oink"><pig/><cow>moo</cow><horse/><'+'?farmer hadA="duck"?></farm>', 'serializeToString');

    //xml pi is stripped out
    doc = domparser.parseFromString(
        '<'+'?xml version="1.0"?><farm sound="oink"><pig/></farm>', 'text/xml');
    root = doc.documentElement;
    equals(root.nodeName, 'farm', 'root.nodeName');
    equals(xmlserializer.serializeToString(root),
        '<farm sound="oink"><pig/></farm>', 'serializeToString');

    /**
     * CDATA is a known deficiency in this approach, e4x turns it into an xml encoded text node
     */
    doc = domparser.parseFromString(
        '<farm sound="oink"><pig/><cow>moo</cow><horse/><![CDATA[old mac ><&!-- d]]></farm>', 'text/xml');
    root = doc.documentElement;
    equals(root.nodeName, 'farm', 'root.nodeName');
    //equals(xmlserializer.serializeToString(root),
    //    '<farm sound="oink"><pig/><cow>moo</cow><horse/><![CDATA[old mac ><&!-- d]]></farm>', 'serializeToString');

    /**
     * whitespace
     */
    doc = domparser.parseFromString(
        '<'+'?xml version="1.0"?>\
        <farm sound="oink">\
            <pig/>\
            <cow>moo</cow>\
            <horse/>\
        </farm>', 'text/xml');
    root = doc.documentElement;
    equals(root.nodeName, 'farm', 'root.nodeName');
    equals(xmlserializer.serializeToString(root),
        '<farm sound="oink">\
            <pig/>\
            <cow>moo</cow>\
            <horse/>\
        </farm>', 'serializeToString');

    /**
     * line breaks
     */
    doc = domparser.parseFromString(
        '<'+'?xml version="1.0"?>\n\
        <farm sound="oink">\n\
            <pig/>\n\
            <cow>moo</cow>\n\
            <horse/>\n\
        </farm>', 'text/xml');
    root = doc.documentElement;
    equals(root.nodeName, 'farm', 'root.nodeName');
    equals(xmlserializer.serializeToString(root),
        '<farm sound="oink">\n\
            <pig/>\n\
            <cow>moo</cow>\n\
            <horse/>\n\
        </farm>', 'serializeToString');

});

test('getElementsByTagName', function() {
    var nodes, doc;
    doc = domparser.parseFromString(
        '<root><div><div>123</div></div><div></div></root>',
        'text/xml'
    );

    nodes = doc.getElementsByTagName('*');
    equals(nodes.length, 4, 'all elements');
    nodes = doc.getElementsByTagName('root');
    equals(nodes.length, 1, 'non-recursive');
    nodes = doc.getElementsByTagName('div');
    equals(nodes.length, 3, 'recursive');
});

