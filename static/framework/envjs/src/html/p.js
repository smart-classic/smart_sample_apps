
/*
* HTMLParagraphElement - DOM Level 2
*/
HTMLParagraphElement = function(ownerDocument) {
    HTMLElement.apply(this, arguments);
};
HTMLParagraphElement.prototype = new HTMLElement();
__extend__(HTMLParagraphElement.prototype, {
    toString: function(){
        return '[object HTMLParagraphElement]';
    }
});

