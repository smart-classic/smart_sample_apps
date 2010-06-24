
/** 
 * HTMLMapElement - DOM Level 2
 */
HTMLMapElement = function(ownerDocument) {
    HTMLElement.apply(this, arguments);
};
HTMLMapElement.prototype = new HTMLElement;
__extend__(HTMLMapElement.prototype, {
    get areas(){
        return this.getElementsByTagName('area');
    },
    get name(){
        return this.getAttribute('name');
    },
    set name(value){
        this.setAttribute('name',value);
    }
});
