/**
 * @tag models, home
 * Wraps backend med services.  Enables 
 * [SmartMedDisplay.Models.Med.static.findAll retrieving],
 */
SmartMedDisplay.Models.rdfObject.
extend('SmartMedDisplay.Models.Med',
/* @Static */
{
	api_function: "med_store",	
	object_type: "med:medication",
	instantiateByType: function() {
		
		if (this.rdf === undefined || !this.rdf instanceof jQuery.rdf)
			throw "rdfToMeds needs a jquery.rdf to work with!";
		
		var ret = []
		           
		this.rdf.prefix("med","http://smartplatforms.org/med#");
		       		
		var r = this.rdf
		 .where("?med rdf:type "+this.object_type)
		 .where("?med dcterms:title ?medlabel")
		 .optional("?med med:strength ?strength")
		 .optional("?med med:strengthUnits ?strengthUnits")
		 .optional("?med med:form ?form")
		 .optional("?med med:drug ?cui")
		 .optional("?med med:dose ?dose")
		 .optional("?med med:doseUnits ?doseUnits")
		 .optional("?med med:route ?route")
		 .optional("?med med:frequency ?freq")
		 .optional("?med med:startDate ?sd")
		 .optional("?med med:endDate ?ed");
			
		for (var i = 0; i < r.length; i++) {
			var m = r[i];
			ret.push(new SmartMedDisplay.Models.Med({
				drug: m.medlabel.value,
				dose: m.dose? m.dose.value :  "",
				unit: m.doseUnits? m.doseUnits.value.fragment: "",
				frequency: m.freq? m.freq.value: "",
				route: m.route?m.route.value.fragment: "",
				strength: m.strength?m.strength.value: "",
				strengthUnits:m.strengthUnits? m.strengthUnits.value.fragment: "",
				form: m.form?m.form.value.fragment: "",
				cui: m.cui ? m.cui.value: "",
				rdf : m
			}));
		}
		
		return ret;
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
		

		if (params.rdf.sd)
		{
		var start = this.Class.rdf.where(params.rdf.sd.value + " dc:date ?start")[0].start.value;
		this.start_date = Date.parse(start).toISOString();
		}
		else this.start_date = null;
		
		if (params.rdf.ed){
		var end = this.Class.rdf.where(params.rdf.ed.value + " dc:date ?end")[0].end.value;
		this.end_date  = Date.parse(end).toISOString();
		}
		else this.end_date = null;

	},

    properName : function() {
		return this.drug.toUpperCase();
	},
	
	
	toString: function() {
		 return this.dose + " " + this.unit + " " + this.route + " " + this.frequency;	
	},
	
	toTimelineEvent : function() {
		var event = {};
		event.title = this.drug;
		event.description = this.toString();
		event.isDuration = false;
		
		if (this.start_date|| this.end_date)
		{
			event.start = this.start_date ;//"2008-08-05";// this.rdf.start_date.value;
			event.end = this.end_date;
			event.isDuration = true;
			event.image = "http://pillbox.nlm.nih.gov/assets/super_small/684620195ss.png";		
		}
		
		return event;
	}
	
	
});