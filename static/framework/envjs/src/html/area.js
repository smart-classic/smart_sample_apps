
/*
 * HTMLAreaElement - DOM Level 2
 *
 * HTML5: 4.8.13 The area element
 * http://dev.w3.org/html5/spec/Overview.html#the-area-element
 */
HTMLAreaElement = function(ownerDocument) {
    HTMLElement.apply(this, arguments);
};
HTMLAreaElement.prototype = new HTMLElement();
__extend__(HTMLAreaElement.prototype, {
    get accessKey(){
        return this.getAttribute('accesskey');
    },
    set accessKey(value){
        this.setAttribute('accesskey',value);
    },
    get alt(){
        return this.getAttribute('alt') || '';
    },
    set alt(value){
        this.setAttribute('alt',value);
    },
    get coords(){
        return this.getAttribute('coords');
    },
    set coords(value){
        this.setAttribute('coords',value);
    },
    get href(){
        return this.getAttribute('href') || '';
    },
    set href(value){
        this.setAttribute('href',value);
    },
    get noHref(){
        return this.hasAttribute('href');
    },
    get shape(){
        //TODO
        return 0;
    },
    /*get tabIndex(){
      return this.getAttribute('tabindex');
      },
      set tabIndex(value){
      this.setAttribute('tabindex',value);
      },*/
    get target(){
        return this.getAttribute('target');
    },
    set target(value){
        this.setAttribute('target',value);
    },

    /**
     * toString like <a>, returns the href
     */
    toString: function() {
        return this.href;
    }
});

