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
		SMART.send_ready_message(this.callback(function(user_and_record_context, incoming_data) {
			if (incoming_data.rdf) {
			  var rdf = SMART.process_rdf("xml", incoming_data.rdf);
		      this.meds = Smart.Models.Med.saveRDF(rdf)[0];
		      this.context= incoming_data.context;
		      for (var i = 0; i < this.meds.length; i++) {
		    	  var d = this.meds[i].drug;
		    	  var r = new RegExp(d, "ig");
		    	 this.context = this.context.replace(r, "<span class='drug'>"+d+"</span>");
		      }
		      this.render_list();
			}
			else
				alert("Don't launch 'med batch add' directly.");
		}));	
		
	},
	
	".submit_all click" :  function(el) {
		el.attr("disabled", "true");
		this.save_meds();
	},
	".select_all click" :  function(el) {
	  	$(".one_med_review").each(function() {$(this).controller().check();});
	},
	
	".select_none click" :  function(el) {
	  	$(".one_med_review").each(function() {$(this).controller().uncheck();});
	 },
	
	save_meds: function() {
		  	$(".one_med_review").each(function() {
		  		$(this).controller().update_med();		  		
		  	});

		 
		for (var i = 0; i < this.meds.length; i++) {
  		  if (this.meds[i].checked === false)
			continue;
			
		  var xml = this.meds[i].toRDFXML();
		  var dname = this.meds[i].drug;
		  (function(xml, dname) {
		  Smart.Models.Med.post(xml, function(){
			  $('#interact').append($("<p>Added Med: " + dname+"</p>\n"));
		      }
		  )})(xml, dname);
      	  }

		var $view_meds = $('<div class="view_link">View med list!</div>');
		$('#interact').append($view_meds);
		$view_meds.click(function() {
			SMART.start_activity("view_medications");			
		});

	 },
	
	render_list: function() {
	      
	  	$('#all_meds_review').html(
				this.view('all_meds', {meds: this.meds})
		);
	  	
	  	$('#all_meds_review .one_med_review').each(function(index) {
	  		$(this).med_batch_add_one_med();
	  	});
	  	
	  	$('#source_note').width($('#all_meds_review table').width());
	  	
	  	$('#source_note').html(this.context);
		      			      	
	}

});