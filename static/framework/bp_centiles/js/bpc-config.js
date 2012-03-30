// Configuration setting of the BPC app
//
// Author: Nikolai Schwertner
//
// Revision history:
//     2011-06-21 Refactored
//     2011-05-19 Added inline documentation; added getTermLabel function
//     2011-05-18 Initial split from main code
//
//    TO DO:
//       [ ] Implement a mechanism for loading the settings from data files
//       [X] Add vertical displacement for the graphs (so as not to abuse the gutter in the long term view)
//       [X] The legend height/width should be calculated based on the dynamic legend content

// Initialize the BPC global obeject as needed
var BPC;
if (!BPC) {
    BPC = {};
}

(function () {
    "use strict";

    // Percentile interpretation zones data and styling (IMPORTANT: Percents should sum up to 100)
    BPC.zones = [
        {definition: "Hypotension (< 1%)",       abbreviation: "\\/", label: "Hypotensive", percent: 1, colorhue: 0.7,  opacity: 0.4, dashthrough: false},
        //{definition:"Prehypotension (< 5%)",  abbreviation: "-", label: "Prehypotensive", percent: 4, colorhue: 0.9, opacity: 0.3, dashthrough: false},
        {definition: "Normal",                   abbreviation: "OK", label: "Normal", percent: 89, colorhue: 0.3, opacity: 0.2, dashthrough: false},
        {definition: "Prehypertension (> 90%)", abbreviation: "^", label: "Prehypertensive", percent: 5, colorhue: 0.1, opacity: 0.3, dashthrough: true},
        {definition: "Hypertension (> 95%)",     abbreviation: "/\\", label: "Hypertensive", percent: 5, colorhue: 0,  opacity: 0.4, dashthrough: true}
    ];
    
    // A unicode checkmark character (doesn't work with some of the IE8 fonts): \u2713
    
    // Filter settings defaults
    BPC.filterSettings = {
        encounter: ["Inpatient", "Ambulatory"],
        site: ["Arm", "Leg"],
        position: ["Sitting", "Standing"],
        method: ["Auscultation", "Machine"],
        dateFrom: "1980-01-01",
        dateTo: "2019-01-01"
    };
    
    // The age at which we switch to adult calculations
    BPC.ADULT_AGE = 19;
    
    /**
    * Generates a settings object on request (Private)
    *
    * @param {Boolean} shortTerm Flag for distinguishing between the short and long term views
    * @param {Boolean} systolic Flag for distinguishing between the long term systolic and diastolic graphs
    *
    * @returns {Object} Settings object
    */
    var generateViewSettings = function (shortTerm, systolic) {
    
        // Settings for the long term view (which gets split in two parallel graphs)
        var LT_HEIGHT = 420,
            LT_TOP_GUTTER = 30,
            LT_BOTTOM_GUTTER = 70,
            splitHeight;
        
        // The height of each individual graph content area in the long term view
        splitHeight = Math.round( (LT_HEIGHT - LT_TOP_GUTTER - LT_BOTTOM_GUTTER)/2 );
    
        return {
            // the id of the div tag where the graphics will live
            divID: (shortTerm ? "holder_short" : "holder_long"),
            
            // dimensions for the drawing area (in pixels)
            width: (shortTerm ? 320 : 760),
            height: (shortTerm ? 400 : LT_HEIGHT),
            
            // margins to be left around the main grid (for labels etc)
            leftgutter: (shortTerm ? 65 : 40), 
            rightgutter: (shortTerm ? 65 : 40),
            bottomgutter: (shortTerm ? 70 : (systolic ? LT_HEIGHT - LT_TOP_GUTTER - splitHeight : LT_BOTTOM_GUTTER - 5)),
            topgutter: (shortTerm ? 30 : (systolic ? LT_TOP_GUTTER : splitHeight + LT_TOP_GUTTER + 5)),
            
            // internal padding within the drawing grid (used in the short term view)
            leftpadding: 40, 
            rightpadding: 40,
            
            // parameters for the graph's background grid
            gridRows: (shortTerm ? 16 : 20),  
            gridCols: 20,
            gridColor: "#333",
            
            // Styling definitions for the graph and labels
            dotSize: (shortTerm ? 15 : 4),         // normal radius for the data point circle
            dotSizeSelected: (shortTerm ? 18 : 6), // radius for when the data point is selected (hovered over)
            blanketSize: (shortTerm ? 30 : 20),    // hover area diameter (invisible)
            showDotLabel: shortTerm,    // flag for displaying the percentile within the data circle
            colorS: "hsb(.6, 0.5, 1)",   // systolic pressure line color
            colorD: "hsb(.5, 0.5, 1)",   // diastolic pressure line color
            colorhueDefault: 0.9,          // default colorhue for datapoints when no percentile data is available
            txt: {font: '12px Helvetica, Arial', fill: "#fff"},  // Styling for the popup label data
            txt1: {font: '10px Helvetica, Arial', fill: "#aaa"},  // Styling for the popup label heading
            txt2: {font: '10px Helvetica, Arial', fill: "#fff"},  // Axis labels styling
            txt3: {font: '12px Helvetica, Arial', fill: "#666"},  // Styling for the popup label line headers
            
            // X axis definitons
            minDX: 30,  // minimum spacing between each two consecutive labels
            
            // Y axis definitions
            max: (shortTerm ? 160 : 100),  // maximum value of the data (plotted on the Y axis); this is either mmHg or percentile
            vLabels: (shortTerm ? 16 : 100), // number of labels to display for the Y axis
            vAxisLabel: (shortTerm ? "mmHg" : (systolic ? "Percentile" : null)), // text to be displayed as the units label
            
            // Legend settings
            //txt4: {font: '14px Times New Roman', "font-weight": "bold", "font-style": "italic", fill: "#555"},  // the legend "i" icon text style
            txt5: {font: '12px Helvetica, Arial', fill: "#555", "font-weight": "bold"},  // the legend title text style
            txt6: {font: '10px Helvetica, Arial', fill: "#fff", "text-anchor": "start"}, // the legend items text style
            legendWidth: 160,
            legendHeightEmpty: 34,   // the legend height when there are no items to display
            legendItemHeight: 24,
            
            // Date format
            dateFormat: "dd MMM yyyy",
            
            // Default zone abbreviation and label
            abbreviationDefault: "-",
            labelDefault: "N/A"
        };
    };
    
    /**
    * Returns the graphics settings for the short or long term graphs
    *
    * @param {Boolean} shortTerm Flag for distinguishing between the short and long term views
    * @param {Boolean} systolic Flag for distinguishing between the long term systolic and diastolic graphs
    *
    * @returns {Object} Settings object
    */
    BPC.getViewSettings = (function () {
        
        // Private variables
        var settingsShort,
            settingsLongSystolic,
            settingsLongDiastolic;
        
        return function (shortTerm, systolic) {
            if (!settingsShort) {
                settingsShort = generateViewSettings (true);
            }
            if (!settingsLongSystolic) {
                settingsLongSystolic = generateViewSettings (false,true);
            }
            if (!settingsLongDiastolic) {
                settingsLongDiastolic = generateViewSettings (false,false);
            }
            if (shortTerm) {
                return settingsShort;
            } else if (systolic) {
                return settingsLongSystolic;
            } else {
                return settingsLongDiastolic;
            }
        };
    }());

    /**
    * Returns a sample patient data object
    *
    * @returns {Object} Patient object
    */
    BPC.getSamplePatient = function () {
        var patient = new BPC.Patient("Jane Doe", "1994-03-27", "female");
        patient.data = [
            {timestamp: "1998-04-01T04:32:00Z", height: 85, systolic: 98, diastolic: 73, site: "Arm", position: "Standing", method: "Auscultation", encounter: "Inpatient"},
            {timestamp: "1999-05-25T06:21:00Z", height: 96, systolic: 82, diastolic: 53, site: "Leg", position: "Sitting", method: "Auscultation", encounter: "Ambulatory"},
            {timestamp: "2000-01-12T15:30:00Z", height: 116, systolic: 84, diastolic: 48, site: "Arm", position: "Sitting", method: "Auscultation", encounter: "Ambulatory"},
            {timestamp: "2000-04-24T19:13:00Z", height: 118, systolic: 104, diastolic: 52, site: "Leg", position: "Sitting", method: "Auscultation", encounter: "Ambulatory"},
            {timestamp: "2001-06-30T08:43:00Z", height: 125, systolic: 107, diastolic: 75, site: "Arm", position: "Standing", method: "Machine", encounter: "Inpatient"},
            {timestamp: "2007-12-04T14:07:00Z", height: 175, systolic: 118, diastolic: 66, site: "Leg", position: "Sitting", method: "Machine", encounter: "Inpatient"},
            {timestamp: "2011-08-26T10:24:00Z", height: 182, systolic: 109, diastolic: 74, site: "Leg", position: "Standing", method: "Machine", encounter: "Inpatient"}
        ];
        return patient;
    };
    
    /**
    * Returns the percentile corresponding to an adult patient's blood pressure reading
    *
    * @param {Number} blood_pressure The blood pressure reading to be computed
    * @param {Boolean} systolic true if this is a systlic reading and false if diastolic
    *
    * @returns {Number} Percentile
    */
    BPC.getAdultPercentile = function (blood_pressure, systolic) {
        if (systolic) {
            if (blood_pressure >= 140) return 97.5;
            else if (blood_pressure >= 120) return 92.5;
            else return 50;
        } else {
            if (blood_pressure >= 90) return 97.5;
            else if (blood_pressure >= 80) return 92.5;
            else return 50;           
        }
    };


    /**
    * Resolves term codes to simple labels for use within the BPC app
    *
    * @param {String} termCode The URL of the term code to be resolved
    *
    * @returns {String} The term label or unknown value
    */
    BPC.getTermLabel = (function () {
    
        var prefixSmart = "http://smartplatforms.org/terms/codes/",
            prefixSnomed = "http://purl.bioontology.org/ontology/SNOMEDCT/",
            codes = [];
            
        codes = [
            {codeValue: prefixSmart + "EncounterType#ambulatory", codeTitle: "Ambulatory"},
            {codeValue: prefixSmart + "EncounterType#inpatient", codeTitle: "Inpatient"},
            {codeValue: prefixSmart + "EncounterType#home", codeTitle: "Home"},
            {codeValue: prefixSmart + "EncounterType#emergency", codeTitle: "Emergency"},
            {codeValue: prefixSmart + "EncounterType#field", codeTitle: "Field"},
            {codeValue: prefixSmart + "EncounterType#virtual", codeTitle: "Virtual"},
            {codeValue: prefixSmart + "BloodPressureMethod#auscultation", codeTitle: "Auscultation"},
            {codeValue: prefixSmart + "BloodPressureMethod#machine", codeTitle: "Machine"},
            {codeValue: prefixSnomed + "33586001", codeTitle: "Sitting"},
            {codeValue: prefixSnomed + "10904000", codeTitle: "Standing"},
            {codeValue: prefixSnomed + "61396006", codeTitle: "Left Leg"},
            {codeValue: prefixSnomed + "11207009", codeTitle: "Right Leg"},
            {codeValue: prefixSnomed + "368208006", codeTitle: "Left Arm"},
            {codeValue: prefixSnomed + "368209003", codeTitle: "Right Arm"}
        ];
        
        return function (termCode) {
            var i;

            if (!termCode) {
                return;
            }

            for (i = 0; i < codes.length; i++) {
                if (termCode.toLowerCase() === codes[i].codeValue.toLowerCase()) {
                    return codes[i].codeTitle;
                }
            }
        };
    }());

    /**
    * Returns the staleness time value
    *
    * @param {String} sex ('male' or 'female')
    * @param {Number} age Age in years
    *
    * @returns {Number} The steleness time value in months
    */
    BPC.getHeightStaleness = (function () {
    
        var HEIGHT_STALENESS_DATA = [
            {"sex": "male", "age": 1, "height_stale_after": 0.5},
            {"sex": "male", "age": 2, "height_stale_after": 0.5},
            {"sex": "male", "age": 3, "height_stale_after": 0.75},
            {"sex": "male", "age": 4, "height_stale_after": 1},
            {"sex": "male", "age": 5, "height_stale_after": 1},
            {"sex": "male", "age": 6, "height_stale_after": 1.25},
            {"sex": "male", "age": 7, "height_stale_after": 1.25},
            {"sex": "male", "age": 8, "height_stale_after": 1.5},
            {"sex": "male", "age": 9, "height_stale_after": 1.75},
            {"sex": "male", "age": 10, "height_stale_after": 2},
            {"sex": "male", "age": 11, "height_stale_after": 2},
            {"sex": "male", "age": 12, "height_stale_after": 1.75},
            {"sex": "male", "age": 13, "height_stale_after": 1.5},
            {"sex": "male", "age": 14, "height_stale_after": 1.5},
            {"sex": "male", "age": 15, "height_stale_after": 2.25},
            {"sex": "male", "age": 16, "height_stale_after": 3.75},
            {"sex": "male", "age": 17, "height_stale_after": 6.75},
            {"sex": "male", "age": 18, "height_stale_after": 11.75},
            {"sex": "female", "age": 1, "height_stale_after": 0.5},
            {"sex": "female", "age": 2, "height_stale_after": 0.75},
            {"sex": "female", "age": 3, "height_stale_after": 1.25},
            {"sex": "female", "age": 4, "height_stale_after": 1.25},
            {"sex": "female", "age": 5, "height_stale_after": 1.25},
            {"sex": "female", "age": 6, "height_stale_after": 1.5},
            {"sex": "female", "age": 7, "height_stale_after": 1.75},
            {"sex": "female", "age": 8, "height_stale_after": 2},
            {"sex": "female", "age": 9, "height_stale_after": 2.25},
            {"sex": "female", "age": 10, "height_stale_after": 2.5},
            {"sex": "female", "age": 11, "height_stale_after": 2},
            {"sex": "female", "age": 12, "height_stale_after": 2},
            {"sex": "female", "age": 13, "height_stale_after": 2.75},
            {"sex": "female", "age": 14, "height_stale_after": 4.75},
            {"sex": "female", "age": 15, "height_stale_after": 9},
            {"sex": "female", "age": 16, "height_stale_after": 15.25},
            {"sex": "female", "age": 17, "height_stale_after": 23.25},
            {"sex": "female", "age": 18, "height_stale_after": 32}
        ];

        return function (sex, age) {
        
            var res, i;
            
            for (i = 0; i < HEIGHT_STALENESS_DATA.length; i++) {
                if (HEIGHT_STALENESS_DATA[i].sex === sex && HEIGHT_STALENESS_DATA[i].age === BPC.getYears(age)) {
                    res = HEIGHT_STALENESS_DATA[i].height_stale_after;
                    break;
                }
            }

            return res;
        };
    }());
}());
