
/**
 * HTMLTextAreaElement - DOM Level 2
 */
HTMLTextAreaElement = function(ownerDocument) {
    HTMLInputAreaCommon.apply(this, arguments);
};
HTMLTextAreaElement.prototype = new HTMLInputAreaCommon;
__extend__(HTMLTextAreaElement.prototype, {
    get cols(){
        return this.getAttribute('cols');
    },
    set cols(value){
        this.setAttribute('cols', value);
    },
    get rows(){
        return this.getAttribute('rows');
    },
    set rows(value){
        this.setAttribute('rows', value);
    }
});

