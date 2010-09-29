
/**
 * @class  Namespace -
 *      The Namespace interface represents an namespace in an Element object
 *
 * @param  ownerDocument : The Document object associated with this node.
 */
Namespace = function(ownerDocument) {
    Node.apply(this, arguments);
    // the name of this attribute
    this.name      = "";

    // If this attribute was explicitly given a value in the original document,
    // this is true; otherwise, it is false.
    // Note that the implementation is in charge of this attribute, not the user.
    // If the user changes the value of the attribute (even if it ends up having
    // the same value as the default value) then the specified flag is
    // automatically flipped to true
    this.specified = false;
};
Namespace.prototype = new Node();
__extend__(Namespace.prototype, {
    get value(){
        // the value of the attribute is returned as a string
        return this.nodeValue;
    },
    set value(value){
        this.nodeValue = value+'';
    },
    get nodeType(){
        return Node.NAMESPACE_NODE;
    },
    get xml(){
        var ret = "";

          // serialize Namespace Declaration
          if (this.nodeName != "") {
            ret += this.nodeName +"=\""+ __escapeXML__(this.nodeValue) +"\"";
          }
          else {  // handle default namespace
            ret += "xmlns=\""+ __escapeXML__(this.nodeValue) +"\"";
          }

          return ret;
    },
    toString: function(){
        return '[object Namespace]';
    }
});

