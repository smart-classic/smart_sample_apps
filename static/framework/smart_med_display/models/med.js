/**
 * @tag models, home
 * Wraps backend med services.  Enables 
 * [SmartMedDisplay.Models.Med.static.findAll retrieving],
 */
SmartMedDisplay.Models.rdfObject.
extend('SmartMedDisplay.Models.Med',
/* @Static */
{
	api_function: "meds.get_all",	
	objectType: "<med:medication>",
	instantiateByType: function() {
		if (this.rdf === undefined || !this.rdf instanceof jQuery.rdf)
			throw "rdfToMeds needs a jquery.rdf to work with!";
		
		var ret = []
		
		var r = this.rdf
		 .where("?med rdf:type "+this.objectType)
		 .where("?med med:drug ?cui")
		 .where("?med med:dose ?dose")
		 .where("?med med:doseUnits ?doseUnits")
		 .where("?med med:route ?route")
		 .where("?med med:frequency ?freq")
		 .where("?cui dcterms:title ?medlabel")
		 .where("?cui med:strength ?strength")
		 .where("?cui med:strengthUnits ?strengthUnits")
		 .where("?cui med:form ?form");
			
		for (var i = 0; i < r.length; i++) {
			var m = r[i];
			ret.push(new SmartMedDisplay.Models.Med({
				drug: m.medlabel.value,
				dose: m.dose.value,
				unit: m.doseUnits.value.path,
				frequency: m.freq.value,
				route: m.route.value.path,
				strength: m.strength.value,
				strengthUnits: m.strengthUnits.value.path,
				form: m.form.value.path
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
		this.unit = params.unit+ "("+
				params.strength+" " + 
				params.strengthUnits+" " + 
				params.form+")";
		this.route = params.route;
		this.frequency = params.frequency||"";
		this.notes = params.notes || "";	
	},

    properName : function() {
		return this.drug.toUpperCase();
	}
});