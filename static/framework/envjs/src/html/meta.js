
/**
 * HTMLMetaElement - DOM Level 2
 * HTML5: 4.2.5 The meta element
 * http://dev.w3.org/html5/spec/Overview.html#meta
 */
HTMLMetaElement = function(ownerDocument) {
    HTMLElement.apply(this, arguments);
};
HTMLMetaElement.prototype = new HTMLElement();
__extend__(HTMLMetaElement.prototype, {
    get content() {
        return this.getAttribute('content') || '';
    },
    set content(value){
        this.setAttribute('content',value);
    },
    get httpEquiv(){
        return this.getAttribute('http-equiv') || '';
    },
    set httpEquiv(value){
        this.setAttribute('http-equiv',value);
    },
    get name(){
        return this.getAttribute('name') || '';
    },
    set name(value){
        this.setAttribute('name',value);
    },
    get scheme(){
        return this.getAttribute('scheme');
    },
    set scheme(value){
        this.setAttribute('scheme',value);
    },
    toString: function() {
        return '[object HTMLMetaElement]';
    }
});

