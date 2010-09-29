
/*
 * HTMLHRElement
 * HTML5: 4.5.2 The hr Element
 * http://dev.w3.org/html5/spec/Overview.html#the-hr-element
 */
HTMLHRElement = function(ownerDocument) {
    HTMLElement.apply(this, arguments);
};

HTMLHRElement.prototype = new HTMLElement();
__extend__(HTMLHRElement.prototype, {

    // no additional properties or elements

    toString: function() {
        return '[object HTMLHRElement]';
    }
});

