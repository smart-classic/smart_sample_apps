jQuery.Controller.extend('SmartApp.MainController',
/* @Static */
{
    onDocument: true
},
/* @Prototype */
{
    load: function() {
		$("#UserDisplay").empty();
		jQuery("#MedList").med_calendar_med_calendar();		
    }
});