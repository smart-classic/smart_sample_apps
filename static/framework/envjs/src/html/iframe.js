
/*
 * HTMLIFrameElement - DOM Level 2
 *
 * HTML5: 4.8.3 The iframe element
 * http://dev.w3.org/html5/spec/Overview.html#the-iframe-element
 */
HTMLIFrameElement = function(ownerDocument) {
    HTMLFrameElement.apply(this, arguments);
};
HTMLIFrameElement.prototype = new HTMLFrameElement();
__extend__(HTMLIFrameElement.prototype, {
    get height() {
        return this.getAttribute("height") || "";
    },
    set height(val) {
        return this.setAttribute("height",val);
    },
    get width() {
        return this.getAttribute("width") || "";
    },
    set width(val) {
        return this.setAttribute("width",val);
    },
    toString: function(){
        return '[object HTMLIFrameElement]';
    }
});
