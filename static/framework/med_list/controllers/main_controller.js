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
		
		SMART.send_ready_message(function(record_info) {	
			  	$("#UserDisplay").html(record_info.full_name)
				$("#MedList").med_list_med_list();
				});

		

    }


});