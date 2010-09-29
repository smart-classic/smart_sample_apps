
/*
 * HTMLBodyElement - DOM Level 2
 * HTML5: http://dev.w3.org/html5/spec/Overview.html#the-body-element-0
 */
HTMLBodyElement = function(ownerDocument) {
    HTMLElement.apply(this, arguments);
};
HTMLBodyElement.prototype = new HTMLElement();
__extend__(HTMLBodyElement.prototype, {
    onload: function(event){
        __eval__(this.getAttribute('onload')||'', this);
    },
    onunload: function(event){
        __eval__(this.getAttribute('onunload')||'', this);
    },
    toString: function() {
        return '[object HTMLBodyElement]';
    }
});
