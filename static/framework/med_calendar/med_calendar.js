steal.plugins('jquery',
	'smart',
	'med_calendar/resources/fullcalendar')
    .css('stylesheets/jquery-ui-1.8.2.custom')
    .css('stylesheets/med_display')
    .css('resources/fullcalendar/fullcalendar')
    .controllers('main', 'med_calendar','timeline')
    .views();
