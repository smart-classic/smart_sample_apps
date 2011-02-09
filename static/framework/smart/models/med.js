/**
 * @tag models, home Wraps backend med services. Enables
 *      [Smart.Models.Med.static.findAll retrieving],
 */
Smart.Models.RdfObject.
extend('Smart.Models.Med',
/* @Static */
{
	
	from_rdf_array: function(meds) {
		var ret = [];
		for (var i = 0; i < meds.length; i++) {
			var rdf = SMART.process_rdf("xml", meds[i]);
			var one_chunk =Smart.Models.Med.saveRDF(rdf)[0];
			for (var j = 0; j < one_chunk.length; j++)
				ret.push(one_chunk[j]);
		}
		return ret;
	},
	
	to_rdf_array: function(meds) {
		var ret = [];
		for (var i = 0; i < meds.length; i++) {
			ret.push(meds[i].toRDFXML());
		}
		return ret;
	},

	
	get: function(success, error){
		SMART.MEDS_get_all(	
					this.callback([this.saveRDF, success])
				);  
	},
	
	post: function(data, success, error){
		SMART.MEDS_post(data, success);  
	},

	put: function(data, external_id, success, error){
		SMART.MED_put(data, external_id, success);  
	},

	delete_all: function(success, error){
		SMART.MEDS_delete(success);  
	},
	delete_one: function(uri, success, error){
		SMART.MED_delete(uri, success);  
	},


	object_type: "sp:Medication",
	instantiateByType: function() {
		
		if (this.rdf === undefined || !this.rdf instanceof jQuery.rdf)
			throw "rdfToMeds needs a jquery.rdf to work with!";
		
		var ret = []
		           
		this.rdf.prefix("sp","http://smartplatforms.org/terms#");
		this.rdf.prefix("dcterms","http://purl.org/dc/terms/");
		this.rdf.prefix("dc","http://purl.org/dc/elements/1.1/");
		       		
		var r = this.rdf.where("?med rdf:type "+this.object_type)
			 .where(" ?med sp:drugName ?drug_code")
			 .optional(" ?drug_code sp:code ?cui")
			 .optional(" ?drug_code dcterms:title ?medlabel")
			 .optional(" ?med sp:strength ?strength")
			 .optional(" ?med sp:strengthUnit ?strengthUnit")
			 .optional(" ?med sp:form ?form")
			 .optional(" ?med sp:dose ?dose")
			 .optional(" ?med sp:doseUnit ?doseUnit")
			 .optional(" ?med sp:route ?route")
			 .optional(" ?med sp:instructions ?notes")
			 .optional(" ?med sp:frequency ?freq")
			 .optional(" ?med sp:startDate ?sd")
			 .optional(" ?med sp:endDate ?ed");
			
		for (var i = 0; i < r.length; i++) {
			
			var m = r[i];
	        var med = r[i].med;
	        med = SMART.node_name(med);

			ret.push(new Smart.Models.Med({params: {
				drug: m.medlabel.value,
				dose: m.dose? m.dose.value :  "",
				doseUnit: m.doseUnit? m.doseUnit.value: "",
				frequency: m.freq? m.freq.value: "",
				route: m.route?m.route.value: "",
				strength: m.strength?m.strength.value: "",
				strengthUnit:m.strengthUnit? m.strengthUnit.value: "",
				form: m.form?m.form.value: "",
				notes: m.notes?m.notes.value: "",
				cui: m.cui ? m.cui.value: "",
				rdf : r[i],
				details: m,
				nodename: med
			}}));
		}
		
		return ret;
	},
	earlier: function(a,b)
	{	if (a == null) return b;
		if (b == null) return a;
		return (a<b)? a : b;
	},
	later: function(a,b)
	{	if (a == null) return b;
		if (b == null) return a;
		return (a>b)? a : b;
	},

	findDispenseEvents: function() {
		var dispenses_by_med = {};

		
		var fulfillments = this.rdf
		    .where("?med rdf:type sp:Medication")
		    .where("?med sp:fulfillment ?f")
		    .where("?f dc:date ?d")
		    .optional("?f sp:dispenseQuantity ?q");

		for (var i = 0; i < fulfillments.length; i++)
		{
			var ds = [];

			var devent = {};			
			var d = $.trim(fulfillments[i].d.value);
			var d = Date.parse(d.substring(0,10));
			
			devent.quantity = fulfillments[i].q.value;
			devent.title = devent.quantity;
			devent.description = d.toString('M/d/yyyy') + ": Dispensed " + fulfillments[i].q.value;
			devent.start = d;
			devent.end = d;

			devent.instant = true;
			m = SMART.node_name(fulfillments[i].med);
			if (dispenses_by_med[m] === undefined )
				dispenses_by_med[m] = [];
			
			dispenses_by_med[m].push(devent);
		}
		 
		var sort_ds = function(a,b){return (a.start>b.start)-(a.start<b.start);};
		jQuery.each(dispenses_by_med, function(k, v) {
			dispenses_by_med[k].sort(sort_ds)
		});
	
		this.dispenses_by_med = dispenses_by_med;
	}

	
},
/* @Prototype */
{	
	init: function() {
		if (!this.params) return;
		var params = this.params;
		
		this.drug = params.drug;
		this.dose = params.dose;
		this.doseUnit = params.doseUnit;
		this.strength= params.strength;
		this.strengthUnit = params.strengthUnit;
		
		this.route = params.route;
		this.frequency = params.frequency||"";
		this.instructions = params.notes || "";	
		this.cui = params.cui;
		this.rdf = params.rdf;
		this.nodename = params.nodename;

		if (params.details.sd)
		{
		this.start_date = Date.parse(params.details.sd.value);
		}
		else this.start_date = null;
		
		if (params.details.ed){
		this.end_date  = Date.parse(params.details.ed.value);
		}
		else this.end_date = null;

	},

    properName : function() {
		return this.drug;
	},
	
	
	toString: function() {
		 return this.dose + " " + this.unit + " " + this.route + " " + this.frequency;	
	},
	
	toRDFXML: function() {
		
		var rdf = $.rdf()
		  .prefix('sp', 'http://smartplatforms.org/terms#')
		  .prefix('dcterms', 'http://purl.org/dc/terms/')
		  .prefix('rdf', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#');

		rdf.add('_:m rdf:type sp:Medication .');
		rdf.add('_:m sp:drugName _:med_code .');
		
		if (this.drug)
			rdf.add('_:med_code dcterms:title "'+this.drug+'" .');

		if (this.cui)
			rdf.add('_:med_code sp:code <'+this.cui+'> .');
		
		if (this.dose)
		rdf.add('_:m sp:dose "'+this.dose+'" .');
		
		if (this.dose_units)
		rdf.add('_:m sp:doseUnit "'+this.dose_units+'" .');
		
		if (this.strength)
			rdf.add('_:m sp:strength "'+this.strength+'" .');
		
		if (this.strength_units)
		rdf.add('_:m sp:strengthUnit "'+this.strength_units+'" .');
		
		if (this.instructions)
		rdf.add('_:m sp:instructions "'+this.instructions+'" .');
		
		if (this.frequency)
		rdf.add('_:m sp:frequency "'+this.frequency+'" .');
		
		if (this.route)
		rdf.add('_:m sp:route "'+this.route+'" .');

		return jQuery.rdf.dump(rdf.databank.triples(), {format:'application/rdf+xml', serialize: true});
		
	},
	
	
	load_spl_rdf: function(callback ){
		// No need to load more than once...
		if (typeof this.spl !== 'undefined') return;
		
		var rxn_cui = this.cui.path.split("/");
		rxn_cui = rxn_cui[rxn_cui.length-1];
		var _this = this;
		SMART.SPL_get(rxn_cui, function(rdf) {
			new_t = rdf.databank.triples();
			for (var i = 0; i < new_t.length; i++)
				_this.Class.rdf.databank.add(new_t[i]);

			_this.spl = {};
			
			_this.spl.images = [];
			var images = _this.Class.rdf
		    .where("<"+_this.cui._string+"> <http://www.accessdata.fda.gov/spl/data> ?d")
		    .where("?d <http://pillbox.nlm.nih.gov/image> ?i");

			for (var i = 0; i < images.length; i++)
			{
				_this.spl.images.push(images[i].i.value._string);
			}

			images = _this.Class.rdf
		    .where("<"+_this.cui._string+"> <http://www.accessdata.fda.gov/spl/data> ?d")
		    .where("?d <http://www.accessdata.fda.gov/spl/data/image> ?i");
			
			for (var i = 0; i < images.length; i++)
			{
				_this.spl.images.push(images[i].i.value._string);
			}

					
			callback();
		});
	},
	
	toTimelineEvents : function() {
		var dispenses = this.Class.dispenses_by_med[this.nodename] || [];
		if (dispenses.length > 0)
		{
			this.start_date = this.Class.earlier(this.start_date,dispenses[0].start);
			this.end_date = this.Class.later(this.end_date, dispenses[dispenses.length-1].start);			
		}
		
		var main_event = {};
		main_event.instant = true;
		main_event.title = this.drug;
		main_event.description = this.toString();
		
		if (this.start_date|| this.end_date)
		{
			if (this.start_date !== this.end_date)
				main_event.instant = false;
			
			main_event.start = this.start_date ;// "2008-08-05";
			main_event.end = this.end_date;
// main_event.image =
// "http://pillbox.nlm.nih.gov/assets/super_small/684620195ss.png";
		}		
		

		if (main_event.start === undefined && main_event.end === undefined && dispenses.length == 0){
			return [];
		}
		
		if (main_event.start != main_event.end || dispenses.length == 0){
			dispenses.push(main_event);
		} 
		else
		{
			dispenses[0].title = main_event.title +": " + dispenses[0].title;
			main_event.title = "";
		}
	
		
		return dispenses;
	}

});
