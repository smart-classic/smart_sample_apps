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

	this.getSPLDetails(med, ret);
	this.getFulfillmentDetails(med, ret);
	this.getImageDetails(med,ret);
	
	return ret;
    },
    getSPLDetails : function(med, ret) {
		var s = "<"+med.cui._string+"> ";
		var r = med.Class.rdf
		 .where(s+ " <http://www.accessdata.fda.gov/spl/data> ?spl")
		 .where("?spl <http://www.accessdata.fda.gov/spl/data/representedOrganization> ?org");
		 
		for (var i = 0; i < r.length; i++)
		{
			var field  = "http://www.accessdata.fda.gov/spl/data/representedOrganization";
			var value = "<a target='_new' href='"+r[i].spl.value._string+"'>"+r[i].org.value+"</a>";
			ret.push([field, value]);
		}
    },
    getFulfillmentDetails : function(med, ret) {

		var r = med.Class.rdf
		.where(med.nodename+" <http://smartplatforms.org/fulfillment> ?o")
		.where("?o ?f_field ?f_detail");
	
		for (var i = 0; i < r.length; i++)
		{
		var field = r[i].f_field.value._string;
		var value = r[i].f_detail.type=="bnode"? "" : r[i].f_detail.value._string || r[i].f_detail.value
		ret.push([field, value]);
		}

    },
    getImageDetails : function(med, ret) {
		var s = "<"+med.cui._string+"> ";
		var firstImage = true;
		
		var r = med.Class.rdf
		 .where(s+ " <http://www.accessdata.fda.gov/spl/data> ?spl")
		 .where(" ?spl <http://pillbox.nlm.nih.gov/image> ?o ");
		for (var i = 0; i < r.length; i++)
		{
			var field  = "http://pillbox.nlm.nih.gov/image";
            extra = firstImage?"<span id='FirstImage'></span><br>":"";
            firstImage = false;
            
			var value = extra+"<img src='"+r[i].o.value._string+"'/>";
			ret.push([field, value]);
		}
	
		r = med.Class.rdf
		 .where(s+ " <http://www.accessdata.fda.gov/spl/data> ?spl")
		 .where(" ?spl <http://www.accessdata.fda.gov/spl/data/image> ?o ");
		for (var i = 0; i < r.length; i++)
		{
			var field  = "http://www.accessdata.fda.gov/spl/data/image";
			extra = firstImage?"<span id='FirstImage'></span><br>":"";
            firstImage = false;
            
			var value = extra+"<img src='"+r[i].o.value._string+"'/>";
			
			ret.push([field, value]);
		}
		
    }
},
/* @Prototype */
{	


});