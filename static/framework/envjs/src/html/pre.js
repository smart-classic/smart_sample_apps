
/*
 * HTMLPreElement
 * HTML5: 4.5.4 The pre Element
 * http://dev.w3.org/html5/spec/Overview.html#the-pre-element
 */
HTMLPreElement = function(ownerDocument) {
    HTMLElement.apply(this, arguments);
};

HTMLPreElement.prototype = new HTMLElement();
__extend__(HTMLPreElement.prototype, {

    // no additional properties or elements

    toString: function() {
        return '[object HTMLPreElement]';
    }
});

