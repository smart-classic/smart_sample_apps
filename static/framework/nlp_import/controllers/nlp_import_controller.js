/**
 * @tag controllers, home
 */
jQuery.Controller.extend('NlpImport.Controllers.NlpImportController',
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
	SMART.message_receivers = {
		foreground: function() {
			window.location.reload();
		}
	};
	SMART.send_ready_message(function(record_info) {});
	
	$('#bb_upload').change(function() {
		$('#bb_file_form').submit();
	 }); 

	$('#bb_file_form').ajaxForm({
		dataType: 'text',
		    beforeSubmit: function(a,f,o) {
		    $('#upload_status').html('Uploading...');
		},        
		success: this.callback(function(data) {
		     $('#upload_status').html('');
		     $('#bb_paste').val(data);
		     this.apply_nlp();
		 })
    }); 
    
    $('#bb_parse_form').submit(this.callback(function() {this.apply_nlp(); return false;}));
},

apply_nlp: function() {
    var note_text = $('#bb_paste').val();
    
    $('#upload_status').html('Applying NLP....\n[please wait].\n\n'+note_text).
    css({width: '100%', height: '100%', 
    	position: 'absolute', top: '0px', left: '0px',
    	background: 'grey'});

    SMART.webhook_post('extract_meds_from_plaintext', note_text, 
	  function(rdf) {
    	SMART.start_activity("batch_add_medications", rdf.source_xml);
    	});
    }

});