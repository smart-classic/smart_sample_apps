
/*
 * HTMLOListElement
 * HTML5: 4.5.6 The ol Element
 * http://dev.w3.org/html5/spec/Overview.html#the-ol-element
 */
HTMLOListElement = function(ownerDocument) {
    HTMLElement.apply(this, arguments);
};

HTMLOListElement.prototype = new HTMLElement();
__extend__(HTMLOListElement.prototype, {

    // TODO: attribute boolean reversed;
    // TODO:  attribute long start;

    toString: function() {
        return '[object HTMLOListElement]';
    }
});

