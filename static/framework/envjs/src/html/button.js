
/*
 * HTMLButtonElement - DOM Level 2
 */
HTMLButtonElement = function(ownerDocument) {
    HTMLTypeValueInputs.apply(this, arguments);
};
HTMLButtonElement.prototype = new HTMLTypeValueInputs;
__extend__(HTMLButtonElement.prototype, inputElements_status);
__extend__(HTMLButtonElement.prototype, {
    get dataFormatAs(){
        return this.getAttribute('dataFormatAs');
    },
    set dataFormatAs(value){
        this.setAttribute('dataFormatAs',value);
    }
});

