/**
 * @tag models, home
 * Wraps backend med services.  Enables 
 * [Smart.Models.Med.static.findAll retrieving],
 */
Smart.Models.RdfObject.
extend('Smart.Models.Problem',
/* @Static */
{
	get: function(success, error){
	SMART.PROBLEMS_get(	
				this.callback([this.saveRDF, success])
			);  
	},

	put: function(data, external_id, success, error){
		SMART.PROBLEMS_put(data, external_id, success);  
	},

	post: function(problem, success, error){
		SMART.PROBLEMS_post(problem.toRDFXML(), success);  
	},
	
	del: function(uri,success, error){
		SMART.PROBLEMS_delete(uri,success);  
	},
	
	object_type: "clin:Problem",
	instantiateByType: function() {
		if (this.rdf === undefined || !this.rdf instanceof jQuery.rdf)
			throw "rdfToMeds needs a jquery.rdf to work with!";
		
		var ret = [];
		           
		this.rdf.prefix("sp","http://smartplatforms.org/");
		this.rdf.prefix("core","http://smartplatforms.org/core#");
		this.rdf.prefix("clin","http://smartplatforms.org/clinical#");
		this.rdf.prefix("prob","http://smartplatforms.org/clinical/problem#");
		this.rdf.prefix("dcterms","http://purl.org/dc/terms/");
		this.rdf.prefix("umls","http://www.nlm.nih.gov/research/umls/");
		
		var r = this.rdf.where("?problem rdf:type "+this.object_type);
			
		for (var i = 0; i < r.length; i++) {
		    var p = new Smart.Models.Problem({rdf: r[i].problem});
		    ret.push(p);
		}
		
	    return ret;

	}
},
/* @Prototype */
{	
	init: function() {
		if (!this.rdf) return;
		
		var p = Smart.Models.Problem.rdf
		.optional(this.nodeName() + " dcterms:title ?title")
		.optional(this.nodeName() + " clin:notes ?notes")
		.optional(this.nodeName() + " prob:onset ?onset")
		.optional(this.nodeName() + " prob:resolution ?resolution")
	    .optional(this.nodeName() + " prob:code ?concept")[0];
		
		if (p.concept)
			this.concept= p.concept.value._string;
		
		this.title = p.title && p.title.type==='literal' ? p.title.value : "?title";
		this.notes = p.notes && p.notes.type==='literal'? p.notes.value : "?notes";
		this.onset = p.onset && p.onset.type==='literal'? p.onset.value : "?onset";
		this.resolution= p.resolution && p.resolution.type==='literal'? p.resolution.value : "?resolution";
		
	},
	
	toRDFXML: function() {
		
		var rdf = $.rdf()
		  .prefix('sp', 'http://smartplatforms.org/')
		  .prefix('dc', 'http://purl.org/dc/elements/1.1/')
		  .prefix('dcterms', 'http://purl.org/dc/terms/')
		  .prefix('rdf', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#')
		  .prefix("core","http://smartplatforms.org/core#")
		  .prefix("clin","http://smartplatforms.org/clinical#")
		  .prefix("prob","http://smartplatforms.org/clinical/problem#");

		rdf.add('_:m rdf:type clin:Problem .');
		
		if (this.concept)
			rdf.add('_:m prob:code <'+this.concept+'> .');
		
		if (this.title)
			rdf.add('_:m dcterms:title "'+this.title+'" .');

		if (this.notes)
			rdf.add('_:m clin:notes "'+this.notes+'" .');
		
		if (this.onset)
			rdf.add('_:m prob:onset "'+this.onset+'" .');

		if (this.resolution)
			rdf.add('_:m prob:resolution "'+this.resolution+'" .');
		
		return jQuery.rdf.dump(rdf.databank.triples(), {format:'application/rdf+xml', serialize: true});
	},
	

	
	toString: function(){
	}
});
