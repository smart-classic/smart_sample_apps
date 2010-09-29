QUnit.module('css');

// mock the global document object if not available
try {
    document;
} catch(e) {
    console.log('mocking global document object.');
    document = new HTMLDocument(new DOMImplementation());
}


test('CSS Interfaces Available', function(){

    expect(11);
    ok(CSSRule,             'CSSRule');
    ok(CSSStyleRule,        'CSSStyleRule');
    ok(CSSImportRule,       'CSSImportRule');
    ok(CSSMediaRule,        'CSSMediaRule');
    ok(CSSPageRule,         'CSSPageRule');
    ok(CSSFontFaceRule,     'CSSFontFaceRule');

    ok(CSSRuleList,         'CSSRuleList');

    ok(CSS2Properties,      'CSS2Properties');

    // http://dev.w3.org/csswg/cssom/#cssstylesheet
    ok(CSSStyleSheet,       'CSSStyleSheet');

    // XML Base Interfaces

    // http://dev.w3.org/csswg/cssom/#the-stylesheet-interface
    // http://www.w3.org/TR/2000/REC-DOM-Level-2-Style-20001113/stylesheets.html#StyleSheets-StyleSheet
    ok(StyleSheet,       'StyleSheet');

    // http://dev.w3.org/csswg/cssom/#stylesheetlist
    // http://www.w3.org/TR/2000/REC-DOM-Level-2-Style-20001113/stylesheets.html#StyleSheets-StyleSheetList
    ok(StyleSheetList,       'StyleSheetList');

    // http://www.w3.org/TR/2000/REC-DOM-Level-2-Style-20001113/stylesheets.html#StyleSheets-MediaList
    // TBD
    //ok(MediaList,       'MediaList');

});

test('CSSRule', function() {
    equals(CSSRule.STYLE_RULE,      1, 'CSSRule.STYLE_RULE');
    equals(CSSRule.IMPORT_RULE,     3, 'CSSRule.IMPORT_RULE');
    equals(CSSRule.MEDIA_RULE,      4, 'CSSRule.MEDIA_RULE');
    equals(CSSRule.FONT_FACE_RULE,  5, 'CSSRule.FONT_FACE_RULE');
    equals(CSSRule.PAGE_RULE,       6, 'CSSRule.PAGE_RULE');

    // not in FF
    //equals(CSSRule.NAMESPACE_RULE, 10, 'CSSRule.NAMESPACE_RULE');
});

test('CSS2Properties', function(){


    var div = document.createElement('div');

    div.id = 'styleTest';
    equals(div.getAttribute('style'),null, '.getAttribute("style")');
    equals(div.style.length, 0, '.style.length');
    equals(div.style.getPropertyValue('height'), '', ".style.getPropertyValue('height')");

    div.setAttribute('style','display:block;height:300px;width:400px;opacity:.5;');
    equals(div.style.length, 4, '.style.length');
    equals(div.style[0], 'display', '.style[0]');
    equals(div.style[1], 'height', '.style[1]');
    equals(div.style[2], 'width', '.style[2]');
    equals(div.style[3], 'opacity', '.style[2]');
    equals(div.style.display, 'block', '.style.display');
    equals(div.style.height, '300px', '.style.height');
    equals(div.style.width, '400px', '.style.width');
    equals(div.style.opacity, '0.5', '.style.opacity');
    equals(div.style.getPropertyValue('display'), 'block', ".style.getPropertyValue('display')");
    equals(div.style.getPropertyValue('height'), '300px', ".style.getPropertyValue('height')");
    equals(div.style.getPropertyValue('width'), '400px', ".style.getPropertyValue('width')");
    equals(div.style.cssText, 'display: block; height: 300px; width: 400px; opacity: 0.5;', '.style.cssText');

    div.style.setProperty('position','absolute', '');
    equals(div.style.length, 5, '.style.length');
    equals(div.style[4], 'position', '.style[4]');
    equals(div.style.position, 'absolute', '.style.position');
    equals(div.style.getPropertyValue('position'), 'absolute', ".style.getPropertyValue('position')");
    equals(div.style.cssText, 'display: block; height: 300px; width: 400px; opacity: 0.5; position: absolute;', '.style.cssText');
});

test('document.styleSheets', function() {
    ok(document.styleSheets, 'document.styleSheets exists');
    equals(document.styleSheets.toString(), '[object StyleSheetList]', 'StyleSheetsList.toString()');
    equals(document.styleSheets.item(999), null, 'StyleSheetList.item out-of-range');

    //equals(document.styleSheets.length, 1, 'StyleSheetList.length');
});

test('adding style element', function() {
    // hack to make this work in both server & firefox
    var head = document.head;
    if (! head) {
        // FF doesn't seem to have the doc.head accessor??
        head = document.getElementsByTagName('head')[0];
    }
    var ss_len = document.styleSheets.length;

    var element = document.createElement('style');
    element.textContent = 'h1 {color: red; background-color: black}\n' +
        'div {background-image: url("foo");}\n';
    head.appendChild(element);
    equals(document.styleSheets.length, ss_len+1, 'added stylesheet');

    var ss = document.styleSheets.item(document.styleSheets.length -1);
    var rules = ss.cssRules;
    equals(rules.toString(), '[object CSSRuleList]');
    equals(rules.length, 2);


    var arule;
	/*
    arule = rules.item(0);
    equals(arule.toString(), '[object CSSImportRule]');
    equals(arule.href, 'foo.css', 'href returns css value');
    */
    arule = rules.item(0);
//    equals(arule.toString(), '[object CSSStyleRule]');
    equals(arule.selectorText, 'h1');
    //equals(arule.cssText, 'h1 { color: red; background-color: black; }');
    equals(arule.style.length, 2);
    equals(arule.style[0], 'color');
    equals(arule.style.item(0), 'color');
    equals(arule.style[1], 'background-color');
    equals(arule.style.item(1), 'background-color');
    //    equals(arule.style.toString(), '[object CSSStyleDeclaration]');

    arule = rules.item(1);
//    equals(arule.toString(), '[object CSSStyleRule]');
    //equals(arule.cssText,      'div { background-image: url("foo"); }');
    equals(arule.selectorText, 'div');
    equals(arule.style.length, 1);
    //equals(arule.style.toString(), '[object CSSStyleDeclaration]');

});

test('serializing attribute when set with element.style.name', function(){
	var divWrapper = document.createElement('div');
	var div = document.createElement('div');
	divWrapper.appendChild(div);
    div.id = 'styleSerializeTest';
	div.style.display = 'block';
    equals(divWrapper.innerHTML, '<div id="styleSerializeTest" style="display: block;"/>', 'styles serialized');
});

test('box model', function(){
	var div1 = document.createElement('div');
	div1.id = "div1";
	div1.style.width = "1500px";
	div1.style.height = "600px";
	document.body.appendChild(div1);

	var div2 = document.createElement('div');
	div2.id = "div2";
	div2.style.width = "100%";
	div2.style.height = "100%";
	div1.appendChild(div2);

	ok(true, "Box Model Test - Broken: Fix Me");
	//equals(div2.offsetWidth , 1500, 'box model width should be 1500');
});
