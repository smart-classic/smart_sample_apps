
/**
 * HTMLTitleElement - DOM Level 2
 *
 * HTML5: 4.2.2 The title element
 * http://dev.w3.org/html5/spec/Overview.html#the-title-element-0
 */
HTMLTitleElement = function(ownerDocument) {
    HTMLElement.apply(this, arguments);
};
HTMLTitleElement.prototype = new HTMLElement();
__extend__(HTMLTitleElement.prototype, {
    get text() {
        return this.innerText;
    },

    set text(titleStr) {
        this.textContent = titleStr;
    },
    toString: function() {
        return '[object HTMLTitleElement]';
    }
});


