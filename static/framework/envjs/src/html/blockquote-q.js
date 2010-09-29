
/*
 * HTMLQuoteElement - DOM Level 2
 * HTML5: 4.5.5 The blockquote element
 * http://dev.w3.org/html5/spec/Overview.html#htmlquoteelement
 */
HTMLQuoteElement = function(ownerDocument) {
    HTMLElement.apply(this, arguments);
};
__extend__(HTMLQuoteElement.prototype, HTMLElement.prototype);
__extend__(HTMLQuoteElement.prototype, {
    /**
     * Quoth the spec:
     * """
     * If the cite attribute is present, it must be a valid URL. To
     * obtain the corresponding citation link, the value of the
     * attribute must be resolved relative to the element. User agents
     * should allow users to follow such citation links.
     * """
     *
     * TODO: normalize
     *
     */
    get cite() {
        return this.getAttribute('cite') || '';
    },

    set cite(value) {
        this.setAttribute('cite', value);
    },
    toString: function() {
        return '[object HTMLQuoteElement]';
    }
});
