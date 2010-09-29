
/**
 * @class  ProcessingInstruction -
 *      The ProcessingInstruction interface represents a
 *      "processing instruction", used in XML as a way to
 *      keep processor-specific information in the text of
 *      the document
 * @extends Node
 * @author Jon van Noort (jon@webarcana.com.au)
 * @param  ownerDocument :  The Document object associated with this node.
 */
ProcessingInstruction = function(ownerDocument) {
    Node.apply(this, arguments);
};
ProcessingInstruction.prototype = new Node();
__extend__(ProcessingInstruction.prototype, {
    get data(){
        return this.nodeValue;
    },
    set data(data){
        // throw Exception if Node is readonly
        if (__ownerDocument__(this).errorChecking && this._readonly) {
            throw(new DOMException(DOMException.NO_MODIFICATION_ALLOWED_ERR));
        }
        this.nodeValue = data;
    },
    get textContent(){
        return this.data;
    },
    get localName(){
        return null;
    },
    get target(){
      // The target of this processing instruction.
      // XML defines this as being the first token following the markup that begins the processing instruction.
      // The content of this processing instruction.
        return this.nodeName;
    },
    set target(value){
      // The target of this processing instruction.
      // XML defines this as being the first token following the markup that begins the processing instruction.
      // The content of this processing instruction.
        this.nodeName = value;
    },
    get nodeType(){
        return Node.PROCESSING_INSTRUCTION_NODE;
    },
    get xml(){
        return "<?" + this.nodeName +" "+ this.nodeValue + "?>";
    },
    toString : function(){
        return "[object ProcessingInstruction]";
    }
});

