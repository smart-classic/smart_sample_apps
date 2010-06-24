
/*
 * HTMLFieldSetElement - DOM Level 2
 */
HTMLFieldSetElement = function(ownerDocument) {
    HTMLLegendElement.apply(this, arguments);
};
HTMLFieldSetElement.prototype = new HTMLLegendElement;
__extend__(HTMLFieldSetElement.prototype, {
    get margin(){
        return this.getAttribute('margin');
    },
    set margin(value){
        this.setAttribute('margin',value);
    }
});
