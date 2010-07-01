/**
 * @tag models, home
 * Wraps backend med services.  Enables 
 * [SmartMedDisplay.Models.Med.static.findAll retrieving],
 */
SmartMedDisplay.Models.rdfObject.
extend('SmartMedDisplay.Models.MedDetails',
/* @Static */
{
	getDetails : function(med) {
		
		var s = "<"+med.cui._string+"> "
		var r = med.Class.rdf
		 .where(s+ " ?p ?o");
		
		var ret = {};
		for (var i = 0; i < r.length; i++)
			ret[r[i].p.value._string] = r[i].o.value._string || r[i].o.value;
		
		return ret;
		
	}
},
/* @Prototype */
{	


});