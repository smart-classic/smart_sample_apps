module('html');

test('HTML Interfaces Available', function(){
    
    expect(41);
    ok(HTMLDocument,            'HTMLDocument defined');
    ok(HTMLElement,             'HTMLElement defined');
    ok(HTMLCollection,          'HTMLCollection defined');
    ok(HTMLAnchorElement,       'HTMLAnchorElement defined');
    ok(HTMLAreaElement,         'HTMLAreaElement defined');
    ok(HTMLBaseElement,         'HTMLBaseElement defined');
    ok(HTMLQuoteElement,        'HTMLQuoteElement defined');
    ok(HTMLBodyElement,         'HTMLBodyElement defined');
    ok(HTMLButtonElement,       'HTMLButtonElement defined');
    ok(HTMLCanvasElement,       'HTMLCanvasElement defined');
    ok(HTMLTableColElement,     'HTMLTableColElement defined');
    ok(HTMLModElement,          'HTMLModElement defined');
    ok(HTMLDivElement,          'HTMLDivElement defined');
    ok(HTMLFieldSetElement,     'HTMLFieldSetElement defined');
    ok(HTMLFormElement,         'HTMLFormElement defined');
    ok(HTMLFrameElement,        'HTMLFrameElement defined');
    ok(HTMLFrameSetElement,     'HTMLFrameSetElement defined');
    ok(HTMLHeadElement,         'HTMLHeadElement defined');
    ok(HTMLIFrameElement,       'HTMLIFrameElement defined');
    ok(HTMLImageElement,        'HTMLImageElement defined');
    ok(HTMLInputElement,        'HTMLInputElement defined');
    ok(HTMLLabelElement,        'HTMLLabelElement defined');
    ok(HTMLLegendElement,       'HTMLLegendElement defined');
    ok(HTMLLinkElement,         'HTMLLinkElement defined');
    ok(HTMLMapElement,          'HTMLMapElement defined');
    ok(HTMLMetaElement,         'HTMLMetaElement defined');
    ok(HTMLObjectElement,       'HTMLObjectElement defined');
    ok(HTMLOptGroupElement,     'HTMLOptGroupElement defined');
    ok(HTMLOptionElement,       'HTMLOptionElement defined');
    ok(HTMLParamElement,        'HTMLParamElement defined');
    ok(HTMLScriptElement,       'HTMLScriptElement defined');
    ok(HTMLSelectElement,       'HTMLSelectElement defined');
    ok(HTMLStyleElement,        'HTMLStyleElement defined');
    ok(HTMLTableElement,        'HTMLTableElement defined');
    ok(HTMLTableSectionElement, 'HTMLTableSectionElement defined');
    ok(HTMLTableCellElement,    'HTMLTableCellElement defined');
    ok(HTMLTableRowElement,     'HTMLTableRowElement defined');
    ok(HTMLTextAreaElement,     'HTMLTextAreaElement defined');
    ok(HTMLTitleElement,        'HTMLTitleElement defined');
    ok(HTMLUnknownElement,      'HTMLUnknownElement defined');

    // Image has a constructor, that implements the HTMLImageElement interface
    // http://dev.w3.org/html5/spec/Overview.html#the-img-element
    ok(Image,                   'Image defined');
    
    // Option has a constructor and implements the HTMLOptionElement interface
    // http://dev.w3.org/html5/spec/Overview.html#the-option-element
    //ok(Option,                  'Option defined');
});

// mock the global document object if not available
try{
    document;
}catch(e){
    document = new HTMLDocument(new DOMImplementation());
    document.body.textContent = 'hello envjs';
}
var xmlserializer = new XMLSerializer();

test('HTMLDocument', function(){

    equals(document.toString(), '[object HTMLDocument]', 'global document is HTMLDocument');
    ok(document.anchors, '.anchors is defined');
    ok(document.applets, '.applets is defined');
    equals(document.attributes, null, '.attributes is null');
    equals(document.location, document.baseURI, '.location is .baseURI');
    
});

test('HTMLDocument.createAttribute', function(){

    var doc, 
        attribute;
    
    attribute = document.createAttribute('envjs');
    
    ok(attribute, 'attribute created');
    equals(attribute.name, 'envjs', '.name');
    equals(attribute.value, '', '.value');
    equals(attribute.specified, true, '.specified');
    equals(attribute.ownerElement, null, '.ownerElement');
    equals(attribute.childNodes.length, 0, '.childNodes.length');
    equals(attribute.localName, 'envjs', '.localName');
    equals(attribute.namespaceURI, null, '.namespaceURI');
    equals(attribute.nodeName, 'envjs', '.nodeName');
    equals(attribute.nodeType, Node.ATTRIBUTE_NODE, 'nodeType is Node.ATTRIBUTE_NODE');
    equals(attribute.ownerDocument, document, '.ownerDocument');
    equals(attribute.parentNode, null, '.parentNode');
    equals(attribute.prefix, null, '.prefix');
    ok(attribute.value = 'abc123', 'set value');
    equals(attribute.value, 'abc123', '.value');
    equals(attribute.name, 'envjs', '.name');
    equals(attribute.toString(), '[object Attr]', '.toString');
    try{
        attribute.name = 'env';
        ok(false, 'name property is only a getter');
    }catch(e){
        ok(true, 'name property is only a getter');
    }
    equals(xmlserializer.serializeToString(attribute), 'abc123', 'xmlserializer');
    
});

test('HTMLDocument.createAttributeNS', function(){

    var attribute;
    
    attribute = document.createAttributeNS('http://www.envjs.com/','x:envjs');
    
    ok(attribute, 'namespaced attribute was created');
    equals(attribute.name, 'x:envjs', '.name');
    equals(attribute.value, '', '.value');
    equals(attribute.specified, true, '.specified');
    equals(attribute.ownerElement, null, '.ownerElement');
    equals(attribute.childNodes.length, 0, '.childNodes.length');
    equals(attribute.localName, 'envjs', '.localName');
    equals(attribute.namespaceURI, 'http://www.envjs.com/', '.namespaceURI');
    equals(attribute.nodeName, 'x:envjs', '.nodeName');
    equals(attribute.nodeType, Node.ATTRIBUTE_NODE, 'nodeType is Node.ATTRIBUTE_NODE');
    equals(attribute.ownerDocument, document, '.ownerDocument');
    equals(attribute.parentNode, null, '.parentNode');
    equals(attribute.prefix, 'x', '.prefix');
    
    ok(attribute.value = 'abc123', 'set value');
    equals(attribute.value, 'abc123', '.value');
    
    ok(attribute.prefix = 'y', 'set prefix');
    equals(attribute.prefix, 'y', '.prefix');
    equals(attribute.name, 'y:envjs', '.name');
    try{
        attribute.name = 'env';
        ok(false, 'name property is only a getter');
    }catch(e){
        ok(true, 'name property is only a getter');
    }
    try{
        attribute.localName = 'env';
        ok(false, 'localName property is only a getter');
    }catch(e){
        ok(true, 'localName property is only a getter');
    }
    equals(attribute.toString(), '[object Attr]', '.toString');
    equals(xmlserializer.serializeToString(attribute), 'abc123', 'xmlserializer');

});

test('HTMLDocument.createElement(unknown)', function(){

    var element;
    
    element = document.createElement('envjs');
    
    ok(element, 'element created');
    equals(element.tagName, 'ENVJS', '.name');
    equals(element.childNodes.length, 0, '.childNodes.length');
    equals(element.localName, 'ENVJS', '.localName');
    equals(element.namespaceURI, null, '.namespaceURI');
    equals(element.nodeName, 'ENVJS', '.nodeName');
    equals(element.nodeType, Node.ELEMENT_NODE, '.nodeType');
    equals(element.ownerDocument, document, '.ownerDocument');
    equals(element.parentNode, null, '.parentNode');
    equals(element.prefix, null, '.prefix');    
    equals(element.toString(), '[object HTMLUnknownElement]', '.toString');
    equals(xmlserializer.serializeToString(element), '<ENVJS/>', 'xmlserializer');
    
    
});

test('HTMLDocument.createElementNS(unknown)', function(){

    var element;
    
    element = document.createElementNS('http://www.envjs.com/','x:envjs');
    
    ok(element, 'element created');
    equals(element.tagName, 'x:envjs', '.tagName');
    equals(element.childNodes.length, 0, '.childNodes.length');
    equals(element.localName, 'envjs', '.localName');
    equals(element.namespaceURI, "http://www.envjs.com/", '.namespaceURI');
    equals(element.nodeName, 'x:envjs', '.nodeName');
    equals(element.nodeType, Node.ELEMENT_NODE, '.nodeType');
    equals(element.ownerDocument, document, '.ownerDocument');
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


test('HTMLDocument.createElement(a)', function(){

    var element;
    
    a = document.createElement('a');
    
    ok(a, 'element created');
    equals(a.tagName, 'A', '.name');
    equals(a.childNodes.length, 0, '.childNodes.length');
    equals(a.localName, 'A', '.localName');
    equals(a.namespaceURI, null, '.namespaceURI');
    equals(a.nodeName, 'A', '.nodeName');
    equals(a.nodeType, Node.ELEMENT_NODE, '.nodeType');
    equals(a.ownerDocument, document, '.ownerDocument');
    equals(a.parentNode, null, '.parentNode');
    equals(a.prefix, null, '.prefix');    
    equals(xmlserializer.serializeToString(a), '<A/>', 'xmlserializer');
    
    equals(a.accessKey, '', '.accessKey has expected value');
    equals(a.charset, '', '.charset has expected value');
    equals(a.coords, '', '.coords has expected value');
    equals(a.href, '', '.href has expected value');
    equals(a.hreflang, '', '.hreflang has expected value');
    equals(a.name, '', '.name has expected value');
    equals(a.rel, '', '.rel has expected value');
    
    a.accessKey = 'abc';
    a.charset = 'abc';
    a.coords = 'abc';
    a.href = 'somewhere';
    a.hreflang = 'abc';
    a.name = 'abc';
    a.rel = 'abc';
    
    var absoluteHref = document.location.toString();
    absoluteHref = absoluteHref.substring(0, absoluteHref.lastIndexOf('/')+1) + 'somewhere';
    
    equals(a.accessKey, 'abc', '.accessKey has expected value');
    equals(a.charset, 'abc', '.charset has expected value');
    equals(a.coords, 'abc', '.coords has expected value');
    equals(a.href, absoluteHref, '.href has expected value');
    equals(a.hreflang, 'abc', '.hreflang has expected value');
    equals(a.name, 'abc', '.name has expected value');
    equals(a.rel, 'abc', '.rel has expected value');
    
});

test('HTMLDocument.createElement(area)', function(){

    var element;
    
    element = document.createElement('area');
    
    ok(element, 'element created');
    equals(element.tagName, 'AREA', '.name');
    equals(element.childNodes.length, 0, '.childNodes.length');
    equals(element.localName, 'AREA', '.localName');
    equals(element.namespaceURI, null, '.namespaceURI');
    equals(element.nodeName, 'AREA', '.nodeName');
    equals(element.nodeType, Node.ELEMENT_NODE, '.nodeType');
    equals(element.ownerDocument, document, '.ownerDocument');
    equals(element.parentNode, null, '.parentNode');
    equals(element.prefix, null, '.prefix');    
    equals(xmlserializer.serializeToString(element), '<AREA/>', 'xmlserializer');
    
});


test('HTMLDocument.createElement(frame)', function(){

    var element;
    
    element = document.createElement('frame');
    
    ok(element, 'element created');
    equals(element.childNodes.length, 0, '.childNodes.length');
    equals(element.contentDocument, null, '.contentDocument');
    equals(element.contentWindow, null, '.contentWindow');
    equals(element.frameBorder, "", '.frameBorder');
    equals(element.longDesc, "", '.longDesc');
    equals(element.localName, 'FRAME', '.localName');
    equals(element.marginHeight, "", '.marginHeight');
    equals(element.marginWidth, "", '.marginWidth');
    equals(element.name, "", '.name');
    equals(element.namespaceURI, null, '.namespaceURI');
    equals(element.nodeName, 'FRAME', '.nodeName');
    equals(element.nodeType, Node.ELEMENT_NODE, '.nodeType');
    equals(element.noResize, false, '.noResize');
    equals(element.ownerDocument, document, '.ownerDocument');
    equals(element.parentNode, null, '.parentNode');
    equals(element.prefix, null, '.prefix');    
    equals(element.scrolling, "", '.scrolling');
    equals(element.src, "", '.src');
    equals(element.tagName, 'FRAME', '.name');
    equals(xmlserializer.serializeToString(element), '<FRAME/>', 'xmlserializer');
    
});


test('HTMLDocument.createElement(script)', function(){

    var element;
    
    element = document.createElement('script');
    
    ok(element, 'element created');
    equals(element.childNodes.length, 0, '.childNodes.length');
    equals(element.localName, 'SCRIPT', '.localName');
    equals(element.namespaceURI, null, '.namespaceURI');
    equals(element.nodeName, 'SCRIPT', '.nodeName');
    equals(element.nodeType, Node.ELEMENT_NODE, '.nodeType');
    equals(element.ownerDocument, document, '.ownerDocument');
    equals(element.parentNode, null, '.parentNode');
    equals(element.prefix, null, '.prefix');    
    equals(element.src, "", '.src');
    equals(element.type, "", '.type');
    equals(element.tagName, 'SCRIPT', '.tagName');
    equals(xmlserializer.serializeToString(element), '<SCRIPT/>', 'xmlserializer');
    debugger;
    element.textContent = 'document.ASDFASDF = "QWERQWER";';
    document.head.appendChild(element);
    equals(document.ASDFASDF, 'QWERQWER', 'script appended to head executes');
    
});

// TODO: forms, input radio 
//http://envjs.lighthouseapp.com/projects/21590/tickets/91-radio-button-value-attribute-output-as-defaultvalue-in-html

/* Image and Option below are unique in the DOM in that they
 *  have defined constructors, and have implied
 *  owner documents.
 */
test("Image", function() {
   var x = new Image()
   // determined experimentally
   equals(x.width, 0, 'default width is 0');
   equals(x.height, 0, 'default height is 0');

   x = new Image(1);
   equals(x.width, 1, 'width');
   equals(x.height, 0, 'default height is 0');

   x = new Image(1,9);
   equals(x.width, 1, 'width');
   equals(x.height, 9, 'height');

   // numbers as strings ok
   x = new Image("1","9");
   equals(x.width, 1, 'width');
   equals(x.height, 9, 'height');

   // make sure attributes are being set.

   equals(x.getAttribute('width'), 1, 'width from attributes');
   equals(x.getAttribute('height'), 9, 'height from attributes');

   // make sure we are getting back true numbers and  not strings 
   equals(typeof(x.width), 'number', 'width is a number');
   equals(typeof(x.height), 'number', 'height is a number');

   // and setting bogus values 
   x.setAttribute('width', 'foo');
   equals(x.width, 0, 'bad width default to 0');  
});


/*test("Option", function() {
   var x = new Option();
});*/
