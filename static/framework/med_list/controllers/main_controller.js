jQuery.Controller.extend('MedList.Controllers.MainController',
/* @Static */
{
    onDocument: true
},
/* @Prototype */
{
    load: function() {

		var 	ORIGIN = null, 
		    FRAME = window.top;

		SMART = new SMART_CLIENT(ORIGIN, FRAME);
		
		SMART.send_ready_message(function(user_and_record_context) {	
			  	$("#UserDisplay").html(user_and_record_context.record.full_name)
				$("#MedList").med_list_med_list();
				});

		

    }


});