
/**
 * @author envjs team
 * @param {Document} onwnerDocument
 */
DocumentType = function(ownerDocument) {
    Node.apply(this, arguments);
    this.systemId = null;
    this.publicId = null;
};
DocumentType.prototype = new Node();
__extend__({
    get name(){
        return this.nodeName;
    },
    get entities(){
        return null;
    },
    get internalSubsets(){
        return null;
    },
    get notations(){
        return null;
    },
    toString : function(){
        return "[object DocumentType]";
    }
});
