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
		 .optional("?med med:frequency ?freq");
			
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
				cui: m.cui ? m.cui.value: ""
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
	},

    properName : function() {
		return this.drug.toUpperCase();
	}
});