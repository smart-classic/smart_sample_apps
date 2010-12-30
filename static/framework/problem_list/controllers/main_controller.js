jQuery.Controller.extend('ProblemList.Controllers.MainController',
/* @Static */
{
    onDocument: true
},
/* @Prototype */
{
    load: function() {
	  if (!$('#ProblemList').length) return;
	  $("#UserDisplay").html(SMART.record.full_name)
	  $("#ProblemList").problem_list_problem_list();
    }
});