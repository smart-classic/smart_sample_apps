/**
 * @tag models, home
 * Wraps backend med services.  Enables 
 * [SmartMedDisplay.Models.Med.static.findAll retrieving],
 */
SmartMedDisplay.Models.rdfObject.
extend('SmartMedDisplay.Models.Med',
/* @Static */
{
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


	object_type: "sp:medication",
	instantiateByType: function() {
		
		if (this.rdf === undefined || !this.rdf instanceof jQuery.rdf)
			throw "rdfToMeds needs a jquery.rdf to work with!";
		
		var ret = []
		           
		this.rdf.prefix("sp","http://smartplatforms.org/");
		this.rdf.prefix("med","http://smartplatforms.org/medication#");
		this.rdf.prefix("dcterms","http://purl.org/dc/terms/");
		this.rdf.prefix("dc","http://purl.org/dc/elements/1.1/");
		       		
		var r = this.rdf.where("?med rdf:type "+this.object_type);
			
		for (var i = 0; i < r.length; i++) {
		    var med = r[i].med.value;
		    if (r[i].med.type === 'uri') med = "<"+med+">";

			 var details = this.rdf
			 .where( med+" dcterms:title ?medlabel")
			 .optional(med+" med:strength ?strength")
			 .optional(med+" med:strengthUnits ?strengthUnits")
			 .optional(med+" med:form ?form")
			 .optional(med+" med:drug ?cui")
			 .optional(med+" med:dose ?dose")
			 .optional(med+" med:doseUnits ?doseUnits")
			 .optional(med+" med:route ?route")
			 .optional(med+" med:instructions ?notes")
			 .optional(med+" med:frequency ?freq")
			 .optional(med+" med:startDate ?sd")
			 .optional(med+" med:endDate ?ed")[0];
			
			var m = details;
			ret.push(new SmartMedDisplay.Models.Med({
				drug: m.medlabel.value,
				dose: m.dose? m.dose.value :  "",
				unit: m.doseUnits? m.doseUnits.value: "",
				frequency: m.freq? m.freq.value: "",
				route: m.route?m.route.value: "",
				strength: m.strength?m.strength.value: "",
				strengthUnits:m.strengthUnits? m.strengthUnits.value: "",
				form: m.form?m.form.value: "",
				notes: m.notes?m.notes.value: "",
				cui: m.cui ? m.cui.value: "",
				rdf : r[i],
					details: m,
				nodename: med
			}));
		}
		
		return ret;
	},
	earlier: function(a,b)
	{	if (a == null) return b;
		if (b == null) return a;
		return (a<b)? a : b;
	},
	later: function(a,b){
		return this.earlier(b,a);
	}


	
},
/* @Prototype */
{	
	init: function(params) {
		this.drug = params.drug;
		this.dose = params.dose;
		this.unit = !params.strength ? "" : 
				params.unit+ " ("+
				params.strength+" " + 
				params.strengthUnits+ 
				//params.form+
				")";
		this.route = params.route;
		this.frequency = params.frequency||"";
		this.notes = params.notes || "";	
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
	getDispenseEvents: function() {
		var ds = [];


		var fulfillments = this.Class.rdf
		    .where(this.nodename+" sp:fulfillment ?f")
		    .where("?f dc:date ?d")
		    .optional("?f sp:dispenseQuantity ?q");

		for (var i = 0; i < fulfillments.length; i++)
		{
			var devent = {};

			devent.med = this;
			var d = Date.parse(fulfillments[i].d.value.substring(0,10));
			
			devent.title = fulfillments[i].q.value;
			devent.description = d.toString('M/d/yyyy') + ": Dispensed " + fulfillments[i].q.value;
			devent.start = d;

			devent.instant = true;
			ds.push(devent);
		}
		
		ds.sort(function(a,b){return (a.start>b.start)-(a.start<b.start);});

		return ds;
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
		var dispenses = this.getDispenseEvents();
		if (dispenses.length > 0)
		{
			this.start_date = this.Class.earlier(this.start_date,dispenses[0].start);
			this.end_date = this.Class.later(this.end_date, dispenses[dispenses.length-1].end);			
		}
		
		var main_event = {};
		main_event.med = this;
		main_event.instant = true;
		main_event.title = this.drug;
		main_event.description = this.toString();
		
		if (this.start_date|| this.end_date)
		{
			if (this.start_date !== this.end_date)
				main_event.instant = false;
			
			main_event.start = this.start_date ;//"2008-08-05";
			main_event.end = this.end_date;
//			main_event.image = "http://pillbox.nlm.nih.gov/assets/super_small/684620195ss.png";		
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