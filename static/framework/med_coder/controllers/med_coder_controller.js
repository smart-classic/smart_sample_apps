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
	        var med_xml = SMART.ready_data;
			if (med_xml) {
				this.init_wizard(med_xml);
			}
			else
				alert("Don't launch med coder directly.");
	},

 init_wizard: function(meds) {
		$("#wizard").med_coder_wizard(meds);
  }
});