
/**
 * HTMLLegendElement - DOM Level 2
 */
HTMLLegendElement = function(ownerDocument) {
    HTMLInputCommon.apply(this, arguments);
};
HTMLLegendElement.prototype = new HTMLInputCommon;
__extend__(HTMLLegendElement.prototype, {
    get align(){
        return this.getAttribute('align');
    },
    set align(value){
        this.setAttribute('align',value);
    }
});

