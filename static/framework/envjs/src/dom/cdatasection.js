
/**
 * @class CDATASection 
 *      CDATA sections are used to escape blocks of text containing 
 *      characters that would otherwise be regarded as markup.
 *      The only delimiter that is recognized in a CDATA section is 
 *      the "\]\]\>" string that ends the CDATA section
 * @extends Text
 * @param  ownerDocument : The Document object associated with this node.
 */
CDATASection = function(ownerDocument) {
    Text.apply(this, arguments);
    this.nodeName = '#cdata-section';
};
CDATASection.prototype = new Text();
__extend__(CDATASection.prototype,{
    get nodeType(){
        return Node.CDATA_SECTION_NODE;
    },
    get xml(){
        return "<![CDATA[" + this.nodeValue + "]]>";
    },
    toString : function(){
        return "[object CDATASection]";
    }
});
