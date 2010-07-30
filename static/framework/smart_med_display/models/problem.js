/**
 * @tag models, home
 * Wraps backend med services.  Enables 
 * [SmartMedDisplay.Models.Med.static.findAll retrieving],
 */
SmartMedDisplay.Models.rdfObject.
extend('SmartMedDisplay.Models.Problem',
/* @Static */
{
	get: function(success, error){
	SMART.PROBLEMS_get(	
				this.callback([this.saveRDF, success])
			);  
	},

	post: function(data, success, error){
		SMART.PROBLEMS_post(data, success);  
	},
	

	put: function(data, success, error){
		var pr = '<?xml version="1.0" encoding="utf-8"?>\
			<rdf:RDF xmlns:dcterms="http://purl.org/dc/terms/" xmlns:foaf="http://xmlns.com/foaf/0.1/" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:sp="http://smartplatforms.org/" xmlns:umls="http://www.nlm.nih.gov/research/umls/">\
	        <rdf:Description rdf:about="http://smartplatforms.org/problem/'+randomUUID()+'">\
	           <rdf:type rdf:resource="http://smartplatforms.org/problem"/>\
	           <umls:cui>'+data.cui+'</umls:cui>\
	           <dcterms:title>'+data.title+'</dcterms:title>\
	           <sp:onset>'+data.onset+'</sp:onset>\
	           <sp:resolution>'+data.resolution+'</sp:resolution>\
	           <sp:notes>'+data.notes+'</sp:notes>\
	        </rdf:Description>\
            </rdf:RDF>';
		SMART.PROBLEMS_put(pr, success);  
	},
	
	del: function(uri,success, error){
		SMART.PROBLEMS_delete(uri,success);  
	},
	
	object_type: "sp:problem",
	instantiateByType: function() {
		if (this.rdf === undefined || !this.rdf instanceof jQuery.rdf)
			throw "rdfToMeds needs a jquery.rdf to work with!";
		
		var ret = [];
		           
		this.rdf.prefix("sp","http://smartplatforms.org/");
		this.rdf.prefix("dcterms","http://purl.org/dc/terms/");
		this.rdf.prefix("umls","http://www.nlm.nih.gov/research/umls/");
		       		
		
		var r = this.rdf.where("?problem rdf:type "+this.object_type);
			
		for (var i = 0; i < r.length; i++) {
		    var p = new SmartMedDisplay.Models.Problem(r[i].problem);
		    ret.push(p);
		}
		
	    return ret;

	}
},
/* @Prototype */
{	
	init: function(rdf) {
		this.rdf = rdf;

		var p = SmartMedDisplay.Models.Problem.rdf
		.where(this.nodeName() + " umls:cui ?cui")
		.optional(this.nodeName() + " dcterms:title ?title")
		.optional(this.nodeName() + " sp:notes ?notes")
		.optional(this.nodeName() + " sp:onset ?onset")
		.optional(this.nodeName() + " sp:resolution ?resolution")[0];
		
		this.cui = p.cui.value;
		this.title = p.title && p.title.type==='literal' ? p.title.value : "?title";
		this.notes = p.notes && p.notes.type==='literal'? p.notes.value : "?notes";
		this.onset = p.onset && p.onset.type==='literal'? p.onset.value : "?onset";
		this.resolution= p.resolution && p.resolution.type==='literal'? p.resolution.value : "?resolution";
		
	},
	toString: function(){
	}
});