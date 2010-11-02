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
		
		SMART.send_ready_message(function(user_and_record_context) {	
			  	$("#UserDisplay").html(user_and_record_context.record.full_name)
				$("#ProblemList").problem_list_problem_list();
				});
		}
});