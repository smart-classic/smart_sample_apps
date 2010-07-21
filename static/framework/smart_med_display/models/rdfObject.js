/**
 * @tag models, home
 * Wraps backend rdf object.
 */
$.Model.extend('SmartMedDisplay.Models.rdfObject',
/* @Static */
	{
	saveRDF: function(rdf) {
		this.rdf = rdf;
		
		// abstract method to instantiate a list of objects from the rdf store.
		return [this.instantiateByType()];
	},
	
	get: function(success, error){
		SMART.MEDS_get_all(	
    				this.callback([this.saveRDF, success])
    			);  
    },

    post: function(data, success, error){
		SMART.MEDS_post(data, success);  
    },

    del: function(success, error){
		SMART.MEDS_delete(success);  
    },

    // Abstract function
    instantiateByType : function() {
    	throw "Subclass must implement abstract function instantiateByType - do not call on rdfObject directly!";
    }
},
/* @Prototype */
{	
});