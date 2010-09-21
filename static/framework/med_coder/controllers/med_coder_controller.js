/**
 * @tag controllers, home
 */
jQuery.Controller.extend('MedCoder.Controllers.MedCoderController',
/* @Static */
{
	onDocument: true

},
/* @Prototype */
{
  init: function() {
		var 	ORIGIN = null, 
		FRAME = window.top;
	
		SMART = new SMART_CLIENT(ORIGIN, FRAME);
		SMART.send_ready_message(this.callback(function(record_info, med_xml) {
			if (med_xml) {
				this.init_wizard(med_xml);
			}
			else
				alert("Don't launch med coder directly.");
//				Smart.Models.Med.get(this.init_wizard);			
		}));	
	},

 init_wizard: function(meds) {
		$("#wizard").med_coder_wizard(meds);
  }
});