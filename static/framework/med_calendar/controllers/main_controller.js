jQuery.Controller.extend('SmartApp.MainController',
/* @Static */
{
    onDocument: true
},
/* @Prototype */
{
    "{window} load": function() {
		$("#UserDisplay").empty();
		jQuery("#MedList").med_calendar_med_calendar();		
    }
});