
/**
 * HTMLLabelElement - DOM Level 2
 * HTML5 4.10.4 The label element
 * http://dev.w3.org/html5/spec/Overview.html#the-label-element
 */
HTMLLabelElement = function(ownerDocument) {
    HTMLInputCommon.apply(this, arguments);
};
HTMLLabelElement.prototype = new HTMLInputCommon();
__extend__(HTMLLabelElement.prototype, inputElements_dataProperties);
__extend__(HTMLLabelElement.prototype, {
    get htmlFor() {
        return this.getAttribute('for');
    },
    set htmlFor(value) {
        this.setAttribute('for',value);
    },
    get dataFormatAs() {
        return this.getAttribute('dataFormatAs');
    },
    set dataFormatAs(value) {
        this.setAttribute('dataFormatAs',value);
    },
    toString: function() {
        return '[object HTMLLabelElement]';
    }
});
