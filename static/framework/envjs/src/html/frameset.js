/**
 * HTMLFrameSetElement - DOM Level 2
 *
 * HTML5: 12.3.3 Frames
 * http://dev.w3.org/html5/spec/Overview.html#frameset
 */
HTMLFrameSetElement = function(ownerDocument) {
    HTMLElement.apply(this, arguments);
};
HTMLFrameSetElement.prototype = new HTMLElement();
__extend__(HTMLFrameSetElement.prototype, {
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
    },
    toString: function() {
        return '[object HTMLFrameSetElement]';
    }
});
