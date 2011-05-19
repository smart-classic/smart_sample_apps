// Initialization routine the UI components of the BPC app
//
// Author: Nikolai Schwertner
// Revision history:
//     2011-05-19 Fixed tabs UI resizing issue
//     2011-05-18 Initial split from main code

/**
* Initializes the various jQuery UI components in the BP app
*/
var initUI  = function () {
	
	// Initialize the jQuert UI tabs object
	$('#tabs').tabs();

    // Initialize the filter toggle buttons
    $( "#encounter_long" ).buttonset();
    $( "#site_long" ).buttonset();
    $( "#position_long" ).buttonset();
    $( "#encounter_table" ).buttonset();
    $( "#site_table" ).buttonset();
    $( "#position_table" ).buttonset();
    
    // Initialize the time filter sliders
    $( "#slider-range-long" ).slider({
        range: true,
        min: 0,
        max: 100,
        values: [ 0, 100 ],
        slide: function( event, ui ) {
            updateDateRangeLong(ui.values[0],ui.values[1]);
        }
    });
    $( "#slider-range-table" ).slider({
        range: true,
        min: 0,
        max: 100,
        values: [ 0, 100 ],
        slide: function( event, ui ) {
            updateDateRangeTable(ui.values[0],ui.values[1]);
        }
    });
    setDateRangeLong($("#slider-range-long").slider("values", 0),$("#slider-range-long").slider("values", 1));
    setDateRangeTable($("#slider-range-table").slider("values", 0),$("#slider-range-table").slider("values", 1));
};