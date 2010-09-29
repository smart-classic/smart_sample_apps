
/**
 * HTMLUnknownElement DOM Level 2
 */
HTMLUnknownElement = function(ownerDocument) {
    HTMLElement.apply(this, arguments);
};
HTMLUnknownElement.prototype = new HTMLElement();
__extend__(HTMLUnknownElement.prototype,{
    toString: function(){
        return '[object HTMLUnknownElement]';
    }
});
