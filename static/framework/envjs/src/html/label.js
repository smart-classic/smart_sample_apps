
/** 
 * HTMLLabelElement - DOM Level 2
 */
HTMLLabelElement = function(ownerDocument) {
    HTMLInputCommon.apply(this, arguments);
};
HTMLLabelElement.prototype = new HTMLInputCommon;
__extend__(HTMLLabelElement.prototype, inputElements_dataProperties);
__extend__(HTMLLabelElement.prototype, {
    get htmlFor(){
        return this.getAttribute('for');
    },
    set htmlFor(value){
        this.setAttribute('for',value);
    },
    get dataFormatAs(){
        return this.getAttribute('dataFormatAs');
    },
    set dataFormatAs(value){
        this.setAttribute('dataFormatAs',value);
    }
});

