
/** 
 * HTMLTitleElement - DOM Level 2
 */
HTMLTitleElement = function(ownerDocument) {
    HTMLElement.apply(this, arguments);
};
HTMLTitleElement.prototype = new HTMLElement;
__extend__(HTMLTitleElement.prototype, {
    get text() {
        return this.innerText;
    },

    set text(titleStr) {
        this.textContent = titleStr; 
    }
});


