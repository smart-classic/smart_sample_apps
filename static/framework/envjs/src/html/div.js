
/*
* HTMLDivElement - DOM Level 2
*/
HTMLDivElement = function(ownerDocument) {
    HTMLElement.apply(this, arguments);
};
HTMLDivElement.prototype = new HTMLElement;
__extend__(HTMLDivElement.prototype, {
    get align(){
        return this.getAttribute('align') || 'left';
    },
    set align(value){
        this.setAttribute('align', value);
    }
});

