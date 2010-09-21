jQuery.Controller.extend('ProblemList.Controllers.MainController',
/* @Static */
{
    onDocument: true
},
/* @Prototype */
{
    load: function() {
	

	if (!$('#ProblemList').length) return;

		var ORIGIN = null, FRAME = window.top;

		SMART = new SMART_CLIENT(ORIGIN, FRAME);
		
		SMART.send_ready_message(function(record_info) {	
			  	$("#UserDisplay").html(record_info.full_name)
				$("#ProblemList").problem_list_problem_list();
				});
		}
});