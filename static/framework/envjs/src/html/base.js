
/*
 * HTMLBaseElement - DOM Level 2
 *
 * HTML5: 4.2.3 The base element
 * http://dev.w3.org/html5/spec/Overview.html#the-base-element
 */
HTMLBaseElement = function(ownerDocument) {
    HTMLElement.apply(this, arguments);
};
HTMLBaseElement.prototype = new HTMLElement();
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
    },
    toString: function() {
        return '[object HTMLBaseElement]';
    }
});

