/**
 * @tag models, home
 * Wraps backend med services.  Enables 
 * [SmartMedDisplay.Models.Med.static.findAll retrieving],
 */
$.Model.extend('SmartMedDisplay.Models.Med',
/* @Static */
{
    /**
     * Retrieves meds data from your backend services.
     * @param {Object} params params that might refine your results.
     * @param {Function} success a callback function that returns wrapped med objects.
     * @param {Function} error a callback function for an error in the ajax request.
     */

	
	getMeds: function(success, error){

	var doInit = function(contentType, data) {
		var ret = [];
		for (var i = 0; i < data.length; i++)
		{
			var m = new SmartMedDisplay.Models.Med(data[i]);
			ret.push(m);
		}
		return [ret];
	};

    SMART.api_call(	"meds.get_all", 
    				{}, 
    				this.callback([doInit, success])
    			);  
	
    }
},
/* @Prototype */
{	
	init: function(params) {
		this.drug = params.drug;
		this.dose = params.dose;
		this.unit = params.unit;
		this.route = params.route;
		this.frequency = params.frequency||"";
		this.notes = params.notes || "";	
	},

    properName : function() {
		return this.drug.toUpperCase();
	}
	
});