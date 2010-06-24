
/**
 * @name Document
 * @w3c:domlevel 2 
 * @uri http://www.w3.org/TR/2000/REC-DOM-Level-2-Events-20001113/events.html
 */
__extend__(Document.prototype, {
    loadXML : function(xmlString) {
        //console.log('Parser::Document.loadXML');
        // create Document
        if(this === document){
            //$debug("Setting internal window.document");
            document = this;
        }
        // populate Document
        try {
            // make sure this document object is empty before we try to load ...
            this.attributes      = new NamedNodeMap(this, this);
            this._namespaces     = new NamespaceNodeMap(this, this);
            this._readonly = false;

            XMLParser.parseDocument(xmlString, this);
            
            Envjs.wait(-1);
        } catch (e) {
            //$error(e);
        }
        return this;
    }
});
