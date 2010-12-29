jQuery.Controller.extend('MedList.Controllers.MainController',
/* @Static */
{
    onDocument: true
},
/* @Prototype */
{
    load: function() {
			  	$("#UserDisplay").html(SMART.user.full_name)
				$("#MedList").med_list_med_list();
    }
});