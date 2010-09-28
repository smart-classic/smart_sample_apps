/**
 * @tag controllers, home
 */
jQuery.Controller.extend('MedBatchAdd.Controllers.MedBatchAddController',
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
			  var rdf = SMART.process_rdf("xml", med_xml);
		      this.meds = Smart.Models.Med.saveRDF(rdf)[0];
		      this.render_list();
			}
			else
				alert("Don't launch 'med batch add' directly.");
		}));	
		
	},
	
	".submit_all click" :  function(el) {
		this.save_meds();
	},
	".select_all click" :  function(el) {
	  	$(".one_med_review").each(function() {$(this).controller().check();});
	},
	
	".select_none click" :  function(el) {
	  	$(".one_med_review").each(function() {$(this).controller().uncheck();});
	 },
	
	save_meds: function() {
		for (var i = 0; i < this.meds.length; i++) {
  		  if (this.meds[i].checked === false)
			continue;
			
		  var xml = this.meds[i].toRDFXML();
		  var dname = this.meds[i].drug;
		  (function(xml, dname) {
		  Smart.Models.Med.post(xml, function(){
			  var h = $('#interact').html();
			  h  = h +  "Added Med: " + dname+"<br>\n";
			  $('#interact').html(h);
		      }
		  )})(xml, dname);
      	  }
	},
	
	render_list: function() {
	      
	  	$('#all_meds_review').html(
				this.view('all_meds', {meds: this.meds})
		);
	  	
	  	$('#all_meds_review .one_med_review').each(function(index) {
	  		$(this).med_batch_add_one_med();
	  	});
		      			      	
	}

});