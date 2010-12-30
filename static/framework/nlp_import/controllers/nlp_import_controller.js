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
	
	SMART.message_receivers = {
		foreground: function() {
			SMART.restart_activity(function(){window.location.reload();});
		}
	};

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
    var note_text = $("<p>"+$('#bb_paste').val()+"</p>").text();

    SMART.webhook_post('extract_meds_from_plaintext', note_text, 
	  function(rdf) {
    	SMART.start_activity("batch_add_medications", {rdf: rdf.source_xml, context: note_text});
    	});
    
    var tago = "<span>", tagc="</span>";
    var note_tagged = tago+(note_text.split(/\s+/g)).join(tagc+' '+tago)+tagc;
    
    $('#upload_status').html('Applying NLP....\n[please wait].\n\n<img src="../smart/images/ajax-loader.gif"/><div id="note_tagged">'+note_tagged+'</div>').
    css({width: '100%', height: '100%', 
    	position: 'absolute', top: '0px', left: '0px',
    	background: 'grey'});

    }

});