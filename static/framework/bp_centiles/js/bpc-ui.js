// Initialization routine the UI components of the BPC app
//
// Author: Nikolai Schwertner
//
// Revision history:
//       2011-06-27 Refactored code
//     2011-05-19 Fixed tabs UI resizing issue
//     2011-05-18 Initial split from main code

// Initialize the BPC global obeject as needed
var BPC;
if (!BPC) {
    BPC = {};
}

(function () {
    "use strict";

    /**
    * Document ready event handler (jQuery style)
    */
    $(document).ready(function() {
        SMART.ready(function() {
            
            if ( typeof SMART === "undefined" ) {
                $("#info").text("Error: SMART Connect interface not found");
            } else {
                // Fire up the SMART API calls and initialize the application asynchronously
                $.when(BPC.get_demographics(), BPC.get_vitals(0))
                 .then( function (demographics, vitals) {
                            var total = vitals.total;
                            BPC.initApp ( BPC.processData(demographics, vitals) );
                            if (BPC.settings.loading_mode === "progressive") {
                                BPC.loadAdditionalVitals (demographics, vitals, BPC.settings.vitals_limit, total);
                            } else {
                                BPC.vitals = vitals;
                                BPC.demographics = demographics;
                            }
                        },
                        function (message) {
                            BPC.displayError (message.data);
                        });
            }
            
            // Add other things to do upon document loading here...
            
        }); // end document.ready handler
        
        SMART.fail (function () {
            BPC.initApp ( BPC.getSamplePatient(), true );
        });
    });
    
    /**
    * Displays an error message on the screen
    */
    BPC.displayError = function(message) {
        $("#info").text("Error: " + message);
    };

    /**
    * Initializes the calculator tab
    */
    BPC.initCalculator = function(bpparams) {
    
        // Initialize the validation engine when available
        if (BPC.initCalculatorValidation) {
            BPC.initCalculatorValidation();
        }
    
        // Set the initial input field values
        $('#add_height').val(Math.round(bpparams.height));
        $('#add_diastolic').val(Math.round(bpparams.diastolic));
        $('#add_systolic').val(Math.round(bpparams.systolic));
        $('#add_age').val(Math.floor(bpparams.age));
        $('#add_months').val(Math.floor(12 * (bpparams.age - Math.floor(bpparams.age))));
        if (bpparams.sex === 'female') {
            $('#add_female').attr("checked", true);
        } else {
            $('#add_male').attr("checked", true);
        }

        // Register the event handlers
        $("form input").live('keyup', function(){
            $("form").submit();
        });

        $("form input").live('change', function(){
            $("form").submit();
        });

        $("form").live('submit', function(event){
        
            var height,
                bpparams,
                percentiles,
                target_percentiles = [99, 95, 90],
                thresholds = "",
                to_display,
                res,
                i;
                
            event.stopPropagation();
            
            height = $('#add_height').val();

            bpparams = {
                age: parseInt($('#add_age').val()) + 1.0/12 * parseInt($('#add_months').val()) , 
                sex: $('input[name="add_gender"]:checked').val(), 
                height: height/100.0, 
                systolic: $('#add_systolic').val(), 
                diastolic: $('#add_diastolic').val(),
                round_results: true
            };
            
            if (bpparams.age && bpparams.height && bpparams.sex) {
                $("#result-label").text(BPC.getYears(bpparams.age) + "y " + BPC.getMonths(bpparams.age) + "m, "
                                        + Math.round(bpparams.height * 100) + " cm, " + bpparams.sex + ", "
                                        + bpparams.systolic + "/" + bpparams.diastolic + " mmHg");
            } else {
                $("#result-label").text("Please enter patient data");
            }
           
            percentiles = bp_percentiles(bpparams);
            
            for (i = 0; i < target_percentiles.length; i++) {
                bpparams.systolic = target_percentiles[i];
                bpparams.diastolic = target_percentiles[i];
                res = bp_thresholds(bpparams);
                if (res.systolic || res.diastolic) {
                    thresholds += "<strong>" + target_percentiles[i] + "%</strong> - " + res.systolic + " / " + res.diastolic + " mmHg";
                    if (i < target_percentiles.length - 1) {
                        thresholds += "<br/>";
                    }
                }
            }

            to_display = {
                        systolic_percentile: (percentiles.systolic ? percentiles.systolic + "%" : ""),
                        diastolic_percentile: (percentiles.diastolic ? percentiles.diastolic + "%" : ""),
                        thresholds: thresholds
            };   

            $("#result-percentiles .spct").text(to_display.systolic_percentile);
            $("#result-percentiles .dpct").text(to_display.diastolic_percentile);
            $("#calculator-thresholds-out").html(to_display.thresholds);
            
            return false;
        });
            
        $("form").submit();
    };


    /**
    * Initializes the various jQuery UI components in the BP app
    */
    BPC.initUI  = function () {
        
        // Initialize the jQuert UI tabs object
        $('#tabs').tabs({
            show: function(event, ui) {
                // Redraw the long term view whenever the tab gets shown (workaround for Raphael label drawing in hidden canvas bug)
                if (ui.tab.hash === "#tab_long") {
                    BPC.redrawViewLong (BPC.patient,BPC.settings.zones);
                }
                else if (ui.tab.hash === "#tab_short") {
                    BPC.redrawViewShort (BPC.patient,BPC.settings.zones);
                }
            }
        });
        
        // Select the default tab
        $('#tabs').tabs({
            selected: BPC.settings.default_view
        });
        
        // Patch to enable filter band persistance by JCM
        $('#tabs').bind('tabsshow', function(ev,ui){
            var target = $(".tab_wrapper", ui.panel);
        
            if (ui.panel.id === 'tab_long' || ui.panel.id ==='tab_table') {
                $("#filters").prependTo(target);
            }
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
                BPC.updateDateRange(ui.values[0],ui.values[1]);
            }
        });

        // Initialize the slider range
        BPC.setDateRange($("#slider-timerange").slider("values", 0),$("#slider-timerange").slider("values", 1));
    };
    
    /**
    * Initializes the default filter button states in the BP app
    */
    BPC.initFilterButtons = function () {
        var i, button;
    
        for (i in BPC.settings.filterButtonsSettings) {
        
            button = BPC.settings.filterButtonsSettings[i];
            
            // Initialize the default filter buttons state
            $('#' + button.handle).attr("checked", button.onByDefault);
            $('#' + button.handle).button("refresh");
            
            // Note: this is a workaround for a jQuery/jQueryUI issue where the state of the underlying object
            // is not updated by jQuery UI clicks and overrides the state of the jQuery ui button element
            //$('[for=chkFilterAmbulatory]').click();
        }

    }

    /**
    * Sets the state for all filter UI components
    *
    * @param {String} state 'enable' or 'disable'
    */
    var setControlsState = function (state) {
        $(".toggle-set").buttonset(state);
        $("#slider-timerange").slider(state);
        $("#tabs").tabs(state);
    };
    
    /**
    * Enables all filter UI components
    */
    BPC.enableControls = function () {
        setControlsState ("enable");
    };

    /**
    * Disables all filter UI components
    */
    BPC.disableControls = function () {
        setControlsState ("disable");
    };
}());