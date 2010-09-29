
/**
 * HTMLStyleElement - DOM Level 2
 * HTML5 4.2.6 The style element
 * http://dev.w3.org/html5/spec/Overview.html#the-style-element
 */
HTMLStyleElement = function(ownerDocument) {
    HTMLElement.apply(this, arguments);
};
HTMLStyleElement.prototype = new HTMLElement();
__extend__(HTMLStyleElement.prototype, {
    get disabled(){
        return this.getAttribute('disabled');
    },
    set disabled(value){
        this.setAttribute('disabled',value);
    },
    get media(){
        return this.getAttribute('media');
    },
    set media(value){
        this.setAttribute('media',value);
    },
    get type(){
        return this.getAttribute('type');
    },
    set type(value){
        this.setAttribute('type',value);
    },
    toString: function() {
        return '[object HTMLStyleElement]';
    }
});
