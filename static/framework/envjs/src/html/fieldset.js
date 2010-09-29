
/*
 * HTMLFieldSetElement - DOM Level 2
 *
 * HTML5: 4.10.2 The fieldset element
 * http://dev.w3.org/html5/spec/Overview.html#the-fieldset-element
 */
HTMLFieldSetElement = function(ownerDocument) {
    HTMLLegendElement.apply(this, arguments);
};
HTMLFieldSetElement.prototype = new HTMLLegendElement();
__extend__(HTMLFieldSetElement.prototype, {
    get margin(){
        return this.getAttribute('margin');
    },
    set margin(value){
        this.setAttribute('margin',value);
    },
    toString: function() {
        return '[object HTMLFieldSetElement]';
    }
});

// Named Element Support
HTMLElement.registerSetAttribute('FIELDSET', 'name', __updateFormForNamedElement__);