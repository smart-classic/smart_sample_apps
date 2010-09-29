
/**
 * @class  DocumentFragment -
 *      DocumentFragment is a "lightweight" or "minimal" Document object.
 * @extends Node
 * @param  ownerDocument :  The Document object associated with this node.
 */
DocumentFragment = function(ownerDocument) {
    Node.apply(this, arguments);
    this.nodeName  = "#document-fragment";
};
DocumentFragment.prototype = new Node();
__extend__(DocumentFragment.prototype,{
    get nodeType(){
        return Node.DOCUMENT_FRAGMENT_NODE;
    },
    get xml(){
        var xml = "",
        count = this.childNodes.length;

        // create string concatenating the serialized ChildNodes
        for (var i = 0; i < count; i++) {
            xml += this.childNodes.item(i).xml;
        }

        return xml;
    },
    toString : function(){
        return "[object DocumentFragment]";
    },
    get localName(){
        return null;
    }
});

