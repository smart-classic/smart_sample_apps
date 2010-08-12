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
	
	var ret = [];

	var r = med.Class.rdf
	.where(med.nodename+" ?p ?o")
	.where("?o ?f_field ?f_detail");

	for (var i = 0; i < r.length; i++)
	{
	var field = r[i].f_field.value._string;
	var value = r[i].f_detail.type=="bnode"? "" : r[i].f_detail.value._string || r[i].f_detail.value
	ret.push([field, value]);
	}

	
	if (med.cui._string == "http://link.informatics.stonybrook.edu/rxnorm/RXCUI/00000")
		return ret;

	var s = "<"+med.cui._string+"> "
	var r = med.Class.rdf
	 .where(s+ " ?p1 ?o1")
	 .where(" ?o1 <http://pillbox.nlm.nih.gov/image> ?o ");
	for (var i = 0; i < r.length; i++)
	{
		var field  = "http://pillbox.nlm.nih.gov/image";
		var value = r[i].o.value._string || r[i].o.value;
		ret.push([field, value]);
	}

	r = med.Class.rdf
	 .where(s+ " ?p1 ?o1")
	 .where(" ?o1 <http://www.accessdata.fda.gov/spl/data/image> ?o ");
	for (var i = 0; i < r.length; i++)
	{
		var field  = "http://www.accessdata.fda.gov/spl/data/image";
		var value = r[i].o.value._string || r[i].o.value;
		ret.push([field, value]);
	}
	
	return ret;	
	}
},
/* @Prototype */
{	


});