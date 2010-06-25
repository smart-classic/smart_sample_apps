/**
 * @tag models, home
 * Wraps backend rdf object.
 */
$.Model.extend('SmartMedDisplay.Models.rdfObject',
/* @Static */
	{
	rdfToJS: function(contentType, data) {
		if (contentType !== "xml")
			throw "getRDF expected an XML document... got " + contentType;
	
		// Get the triples into jquery.rdf
		var d= $.createXMLDocument(data);
		var rdf = $.rdf();
		rdf.load(d, {});
		
		// Load all the namespaces from the xml+rdf into jquery.rdf
		for (var i = 0; i < d.firstChild.attributes.length; i++) {
			a = d.firstChild.attributes[i];
			var match = /xmlns:(.*)/i.exec(a.nodeName);
			if (match.length == 2) {
				rdf.prefix(match[1], a.nodeValue);
			}
		}
		
		// Maintain a static copy of the store.
		this.rdf = rdf;
		
		// abstract method to instantiate a list of objects from the rdf store.
		return [this.instantiateByType()];
	},
	
	get: function(success, error){
		SMART.api_call(	
					this.api_function+"/records/"+SMART.record_info.id, 
    				{}, 
    				this.callback([this.rdfToJS, success])
    			);  
    },

    // Abstract function
    instantiateByType : function() {
    	throw "Subclass must implement abstract function instantiateByType - do not call on rdfObject directly!";
    }
},
/* @Prototype */
{	
});