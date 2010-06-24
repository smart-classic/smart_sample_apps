
/** 
 * HTMLHeadElement - DOM Level 2
 */
HTMLHeadElement = function(ownerDocument) {
    HTMLElement.apply(this, arguments);
};
HTMLHeadElement.prototype = new HTMLElement;
__extend__(HTMLHeadElement.prototype, {
    get profile(){
        return this.getAttribute('profile');
    },
    set profile(value){
        this.setAttribute('profile', value);
    },
    //we override this so we can apply browser behavior specific to head children
    //like loading scripts
    appendChild : function(newChild) {
        var newChild = HTMLElement.prototype.appendChild.apply(this,[newChild]);
        //TODO: evaluate scripts which are appended to the head
        //__evalScript__(newChild);
        return newChild;
    },
    insertBefore : function(newChild, refChild) {
        var newChild = HTMLElement.prototype.insertBefore.apply(this,[newChild]);
        //TODO: evaluate scripts which are appended to the head
        //__evalScript__(newChild);
        return newChild;
    },
    toString: function(){
        return '[object HTMLHeadElement]';
    },
});

