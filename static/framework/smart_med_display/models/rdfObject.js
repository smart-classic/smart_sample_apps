/**
 * @tag models, home
 * Wraps backend med services.  Enables 
 * [SmartMedDisplay.Models.Med.static.findAll retrieving],
 */
$.Model.extend('SmartMedDisplay.Models.rdfObject',
/* @Static */
	{
	
	rdfToJS: function(contentType, data) {
		if (contentType !== "xml")
			throw "getRDF expected an XML document... got " + contentType;
	
		var d= $.createXMLDocument(data);
		var rdf = $.rdf();
		rdf.load(d, {});
	
		for (var i = 0; i < d.firstChild.attributes.length; i++) {
			a = d.firstChild.attributes[i];
			var match = /xmlns:(.*)/i.exec(a.nodeName);
			if (match.length == 2) {
				rdf.prefix(match[1], a.nodeValue);
			}
		}
		this.rdf = rdf;
		
		return [this.instantiateByType()];
	},
	
	get: function(success, error){
		SMART.api_call(	
					this.api_function, 
    				{}, 
    				this.callback([this.rdfToJS, success])
    			);  
    }
},
/* @Prototype */
{	
});