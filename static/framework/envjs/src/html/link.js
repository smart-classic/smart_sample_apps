
/* 
* HTMLLinkElement - DOM Level 2
*/
HTMLLinkElement = function(ownerDocument) {
    HTMLElement.apply(this, arguments);
};
HTMLLinkElement.prototype = new HTMLElement;
__extend__(HTMLLinkElement.prototype, {
    get disabled(){
        return this.getAttribute('disabled');
    },
    set disabled(value){
        this.setAttribute('disabled',value);
    },
    get charset(){
        return this.getAttribute('charset');
    },
    set charset(value){
        this.setAttribute('charset',value);
    },
    get href(){
        return this.getAttribute('href');
    },
    set href(value){
        this.setAttribute('href',value);
    },
    get hreflang(){
        return this.getAttribute('hreflang');
    },
    set hreflang(value){
        this.setAttribute('hreflang',value);
    },
    get media(){
        return this.getAttribute('media');
    },
    set media(value){
        this.setAttribute('media',value);
    },
    get rel(){
        return this.getAttribute('rel');
    },
    set rel(value){
        this.setAttribute('rel',value);
    },
    get rev(){
        return this.getAttribute('rev');
    },
    set rev(value){
        this.setAttribute('rev',value);
    },
    get target(){
        return this.getAttribute('target');
    },
    set target(value){
        this.setAttribute('target',value);
    },
    get type(){
        return this.getAttribute('type');
    },
    set type(value){
        this.setAttribute('type',value);
    },
    onload: function(event){
        __eval__(this.getAttribute('onload')||'', this)
    }
});

