// Initialization routine the UI components of the BPC app
//
// Author: Nikolai Schwertner
// Revision history:
//     2011-05-19 Fixed tabs UI resizing issue
//     2011-05-18 Initial split from main code

/**
* Document onLoad event handler (jQuery style)
*/  
$(document).ready(function() {
    // Add things to do upon document loading
}); // end document.ready handler

/**
* Initializes the calculator tab
*/
var initCalculator = function(bpparams) {
    $('#add_height').val(Math.round(bpparams.height));
    $('#add_diastolic').val(Math.round(bpparams.diastolic));
    $('#add_systolic').val(Math.round(bpparams.systolic));
    $('#add_age').val(Math.floor(bpparams.age));
    $('#add_age_months').val(Math.round(12 * (bpparams.age - Math.floor(bpparams.age))));
    if (bpparams.sex =='female')
        $('#add_female').attr("checked", true);
    else 
        $('#add_male').attr("checked", true); 

    $("form").submit();
};

$("form input").live('keyup', function(){
	$("form").submit();
});

$("form input").live('change', function(){
	$("form").submit();
});

$("form").live('submit', function(event){
	    event.stopPropagation();

	    var height = $('#add_height').val();

            var bpparams = {age: parseInt($('#add_age').val()) + 1.0/12 * parseInt($('#add_age_months').val()) , 
			     sex: $('input[name="add_gender"]:checked').val(), 

			     height: height/100.0, 
			     systolic: $('#add_systolic').val(), 
			     diastolic: $('#add_diastolic').val()};
       
	    var percentiles = bp_percentiles(bpparams);
        
        bpparams.systolic = 90;
        bpparams.diastolic = 90;
        var bp1 = bp_thresholds(bpparams);
        bpparams.systolic = 95;
        bpparams.diastolic = 95;
        var bp2 = bp_thresholds(bpparams);
        bpparams.systolic = 99;
        bpparams.diastolic = 99;
        var bp3 = bp_thresholds(bpparams);
        var thresholds = "";
        if (bp3.systolic || bp3.diastolic) thresholds += "<strong>99%</strong> - " + bp3.systolic + " / " + bp3.diastolic + " mmHg<br/>";
        if (bp2.systolic || bp2.diastolic) thresholds += "<strong>95%</strong> - " + bp2.systolic + " / " + bp2.diastolic + " mmHg<br/>";
        if (bp1.systolic || bp1.diastolic) thresholds += "<strong>90%</strong> - " + bp1.systolic + " / " + bp1.diastolic + " mmHg";

            var to_display = {
			            systolic_percentile: (percentiles.systolic?percentiles.systolic:""),
			            diastolic_percentile: (percentiles.diastolic?percentiles.diastolic:""),
                        thresholds: thresholds
			      };   

	   $("#result .spct").text(to_display.systolic_percentile);
	   $("#result .dpct").text(to_display.diastolic_percentile);
       $("#calculator_thresholds_out").html(to_display.thresholds);
	   return false;
});

/**
* Initializes the various jQuery UI components in the BP app
*/
var initUI  = function () {
	
    // Initialize the jQuert UI tabs object
    $('#tabs').tabs({
        show: function(event, ui) {
            // Redraw the long term view whenever the tab gets shown (workaround for Raphael label drawing in hidden canvas bug)
            if (ui.tab.hash == "#tab_long") {
                redrawViewLong (patient,zone);
            }
            else if (ui.tab.hash == "#tab_short") {
                // TO DO: consider redrawing the short term view
            }
        }
    });
	
	// Patch to enable filter band persistance by JCM
    $('#tabs').bind('tabsshow', function(ev,ui){
		if (ui.panel.id=='tab_short' || ui.panel.id=='tab_calculator') return;

		var target = $(".tab_wrapper", ui.panel);
		$("#filters").prependTo(target);
    });

    // Initialize the filter toggle buttons
    $( "#encounter_long" ).buttonset();
    $( "#site_long" ).buttonset();
    $( "#position_long" ).buttonset();
    $( "#method_long" ).buttonset();
    
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
    setDateRangeLong($("#slider-range-long").slider("values", 0),$("#slider-range-long").slider("values", 1));
};

var enableControls = function () {
    setControlsState ("enable");
};

var disableControls = function () {
    setControlsState ("disable");
};

var setControlsState = function (state) {
    $("#chkLongInpatient").button(state);
    $("#chkLongAmbulatory").button(state);
    $("#chkLongArm").button(state);
    $("#chkLongLeg").button(state);
    $("#chkLongSitting").button(state);
    $("#chkLongStanding").button(state);
    $("#chkLongAuscultation").button(state);
    $("#chkLongMachine").button(state);
    $("#slider-range-long").slider(state);
    $('#tabs').tabs(state);
};