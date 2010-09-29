
/*
 * HTMLLIElement
 * HTML5: 4.5.8 The li Element
 * http://dev.w3.org/html5/spec/Overview.html#the-li-element
 */
HTMLLIElement = function(ownerDocument) {
    HTMLElement.apply(this, arguments);
};

HTMLLIElement.prototype = new HTMLElement();
__extend__(HTMLLIElement.prototype, {

    // TODO: attribute long value;

    toString: function() {
        return '[object HTMLLIElement]';
    }
});

