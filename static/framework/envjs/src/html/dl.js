
/*
 * HTMLDListElement
 * HTML5: 4.5.7 The dl Element
 * http://dev.w3.org/html5/spec/Overview.html#the-dl-element
 */
HTMLDListElement = function(ownerDocument) {
    HTMLElement.apply(this, arguments);
};

HTMLDListElement.prototype = new HTMLElement();
__extend__(HTMLDListElement.prototype, {

    // no additional properties or elements

    toString: function() {
        return '[object HTMLDListElement]';
    }
});

