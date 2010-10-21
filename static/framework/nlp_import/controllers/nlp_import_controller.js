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
    var note_text = $("<p>"+$('#bb_paste').val()+"</p>").text();

    SMART.webhook_post('extract_meds_from_plaintext', note_text, 
	  function(rdf) {
    	clearInterval(loading_animation);
    	SMART.start_activity("batch_add_medications", rdf.source_xml);
    	});
    
    var tago = "<span>", tagc="</span>";
    var note_tagged = tago+(note_text.split(/\s+/g)).join(tagc+' '+tago)+tagc;
    
    $('#upload_status').html('Applying NLP....\n[please wait].\n\n<div id="note_tagged">'+note_tagged+'</div>').
    css({width: '100%', height: '100%', 
    	position: 'absolute', top: '0px', left: '0px',
    	background: 'grey'});

    
    $('#note_tagged span:first').addClass('selected_word');
    var forward = true;
    var loading_animation = setInterval(function() {
    	 var next_tag = $('#note_tagged .selected_word:first');
    	 var two_out;
    	 
    	 if (forward)
    	 {
    		 next_tag = next_tag.next();
    		 two_out = next_tag.next();
    	 }
    	 else {
    		 next_tag = next_tag.prev();
    		 two_out = next_tag.prev();
    	 }

    	 if (!two_out.is("span") || two_out.length === 0)
    	 {
    		 forward = !forward;
    	 }
    	 
    	 $('#note_tagged .selected_word').removeClass('selected_word');
    	 next_tag.addClass('selected_word')
    }, 30);
    
    }

});