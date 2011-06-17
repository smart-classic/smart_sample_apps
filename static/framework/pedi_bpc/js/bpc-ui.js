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
    $('#add_months').val(Math.round(12 * (bpparams.age - Math.floor(bpparams.age))));
    if (bpparams.sex =='female')
        $('#add_female').attr("checked", true);
    else 
        $('#add_male').attr("checked", true); 

    $("form input").live('keyup', function(){
        $("form").submit();
    });

    $("form input").live('change', function(){
        $("form").submit();
    });

    $("form").live('submit', function(event){
        event.stopPropagation();
		
        var height = $('#add_height').val();

        var bpparams = {age: parseInt($('#add_age').val()) + 1.0/12 * parseInt($('#add_months').val()) , 
             sex: $('input[name="add_gender"]:checked').val(), 

             height: height/100.0, 
             systolic: $('#add_systolic').val(), 
	     diastolic: $('#add_diastolic').val(),
  	     round_results: true };
		
		if (bpparams.age && bpparams.height && bpparams.sex) {
			$("#result-label").text(getYears(bpparams.age) + "y " + getMonths(bpparams.age) + "m, "
									+ Math.round(bpparams.height * 100) + " cm, " + bpparams.sex + ", "
									+ bpparams.systolic + "/" + bpparams.diastolic + " mmHg");
		} else {
			$("#result-label").text("Please enter patient data");
		}
       
        var percentiles = bp_percentiles(bpparams);
        
        var target_percentiles = [99, 95, 90];
        var thresholds = "";
        var res;
        
        for (var i = 0; i < target_percentiles.length; i++) {
            bpparams.systolic = target_percentiles[i];
            bpparams.diastolic = target_percentiles[i];
            res = bp_thresholds(bpparams);
            if (res.systolic || res.diastolic) {
                thresholds += "<strong>" + target_percentiles[i] + "%</strong> - " + res.systolic + " / " + res.diastolic + " mmHg";
                if (i < target_percentiles.length - 1) thresholds += "<br/>";
            }
        }

        var to_display = {
                    systolic_percentile: (percentiles.systolic?percentiles.systolic:""),
                    diastolic_percentile: (percentiles.diastolic?percentiles.diastolic:""),
                    thresholds: thresholds
        };   

        $("#result-percentiles .spct").text(to_display.systolic_percentile);
        $("#result-percentiles .dpct").text(to_display.diastolic_percentile);
        $("#calculator_thresholds_out").html(to_display.thresholds);
        return false;
    });
        
    $("form").submit();
};


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
    $( ".toggle-set" ).buttonset();
    
    // Initialize the time filter sliders
    $( "#slider-timerange" ).slider({
        range: true,
        min: 0,
        max: 100,
        values: [ 0, 100 ],
        slide: function( event, ui ) {
            updateDateRange(ui.values[0],ui.values[1]);
        }
    });
    setDateRange($("#slider-timerange").slider("values", 0),$("#slider-timerange").slider("values", 1));
};

/**
* Enables all filter UI components
*/
var enableControls = function () {
    setControlsState ("enable");
};

/**
* Disables all filter UI components
*/
var disableControls = function () {
    setControlsState ("disable");
};

/**
* Sets the state for all filter UI components
*
* @param {String} state 'enable' or 'disable'
*/
var setControlsState = function (state) {
    $( ".toggle-set" ).buttonset(state);
    //$("#chkFilterAmbulatory").button(state);
    $("#slider-timerange").slider(state);
    $('#tabs').tabs(state);
};