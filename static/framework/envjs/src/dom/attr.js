
/**
 * @class  Attr
 *      The Attr interface represents an attribute in an Element object
 * @extends Node
 * @param  ownerDocument : The Document object associated with this node.
 */
Attr = function(ownerDocument) {
    Node.apply(this, arguments);
    // set when Attr is added to NamedNodeMap
    this.ownerElement = null;
    //TODO: our implementation of Attr is incorrect because we don't
    //      treat the value of the attribute as a child text node.
};
Attr.prototype = new Node();
__extend__(Attr.prototype, {
    // the name of this attribute
    get name(){
        return this.nodeName;
    },
    // the value of the attribute is returned as a string
    get value(){
        return this.nodeValue||'';
    },
    set value(value){
        // throw Exception if Attribute is readonly
        if (__ownerDocument__(this).implementation.errorChecking && this._readonly) {
            throw(new DOMException(DOMException.NO_MODIFICATION_ALLOWED_ERR));
        }
        // delegate to node
        this.nodeValue = value;
    },
    get textContent(){
        return this.nodeValue;
    },
    set textContent(newText){
        this.nodeValue = newText;
    },
    get specified(){
        return (this !== null && this !== undefined);
    },
    get nodeType(){
        return Node.ATTRIBUTE_NODE;
    },
    get xml() {
        if (this.nodeValue) {
            return  __escapeXML__(this.nodeValue+"");
        } else {
            return '';
        }
    },
    toString : function() {
        return '[object Attr]';
    }
});

