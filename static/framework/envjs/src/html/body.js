
/*
 * HTMLBodyElement - DOM Level 2
 */
HTMLBodyElement = function(ownerDocument) {
    HTMLElement.apply(this, arguments);
};
HTMLBodyElement.prototype = new HTMLElement;
__extend__(HTMLBodyElement.prototype, {
    onload: function(event){
        __eval__(this.getAttribute('onload')||'', this)
    },
    onunload: function(event){
        __eval__(this.getAttribute('onunload')||'', this)
    }
});

