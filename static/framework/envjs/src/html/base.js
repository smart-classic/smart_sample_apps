
/* 
* HTMLBaseElement - DOM Level 2
*/
HTMLBaseElement = function(ownerDocument) {
    HTMLElement.apply(this, arguments);
};
HTMLBaseElement.prototype = new HTMLElement;
__extend__(HTMLBaseElement.prototype, {
    get href(){
        return this.getAttribute('href');
    },
    set href(value){
        this.setAttribute('href',value);
    },
    get target(){
        return this.getAttribute('target');
    },
    set target(value){
        this.setAttribute('target',value);
    }
});

	