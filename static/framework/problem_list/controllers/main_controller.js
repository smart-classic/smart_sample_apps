jQuery.Controller.extend('ProblemList.Controllers.MainController',
/* @Static */
{
    onDocument: true
},
/* @Prototype */
{
    "{window} load": function() {
	$("#UserDisplay").html("");
	$("#ProblemList").problem_list_problem_list();
    }
});