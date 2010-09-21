/**
 * @tag models, home
 * Wraps backend rdf object.
 */
$.Model.extend('Smart.Models.RdfObject',
/* @Static */
	{
	saveRDF: function(rdf) {
		this.rdf = rdf;
		
		// abstract method to instantiate a list of objects from the rdf store.
		return [this.instantiateByType()];
	},
	
    // Abstract function
    instantiateByType : function() {
    	throw "Subclass must implement abstract function instantiateByType - do not call on RdfObject directly!";
    },
    
},
/* @Prototype */
{	

    nodeName: function() {
	var p = this.rdf.value;
    if (this.rdf.type === 'uri') p= "<"+p+">";
    return p;
	}

});