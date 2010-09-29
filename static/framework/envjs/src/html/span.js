/**
 * HTML 5: 4.6.22 The span element
 * http://dev.w3.org/html5/spec/Overview.html#the-span-element
 * 
 */
HTMLSpanElement = function(ownerDocument) {
    HTMLElement.apply(this, arguments);
};
HTMLSpanElement.prototype = new HTMLElement();
__extend__(HTMLSpanElement.prototype, {
    toString: function(){
        return '[object HTMLSpanElement]';
    }
});

