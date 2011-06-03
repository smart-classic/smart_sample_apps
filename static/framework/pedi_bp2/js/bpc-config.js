// Configuration setting of the BPC app
//
// Author: Nikolai Schwertner
// Revision history:
//     2011-05-19 Added inline documentation; added getTermLabel function
//     2011-05-18 Initial split from main code
//
//    TO DO:
//       [ ] Add data formatting settings for the screen output
//       [ ] Implement a mechanism for loading the settings from data files


/**
* Returns the graphics settings for the short or long term graphs
*
* @param {Boolean} shortTerm Flag for distinguishing between the short and long term views
*
* @returns {Object} Settings object
*/
var getSettings = function (shortTerm, systolic) {
    return {
        // the id of the div tag where the graphics will live
        //divID: (shortTerm? "holder_short":(systolic?"holder_long_systolic":"holder_long_diastolic")),
        divID: (shortTerm? "holder_short":"holder_long"),
        
        // dimensions for the drawing area (in pixels)
        width: 760,
        height: (shortTerm? 400:(systolic?420:420)),
        
        // margins to be left around the main grid (for labels etc)
        leftgutter: (shortTerm? 80:40), 
        rightgutter: (shortTerm? 180:40),
        bottomgutter: (shortTerm? 70:(systolic?230:70)),
        topgutter: (shortTerm? 30:(systolic?30:190)),
        
        // internal padding within the drawing grid (used in the short term view)
        leftpadding: 40, 
        rightpadding: 40,
        
        // parameters for the graph's background grid
        gridRows: (shortTerm? 16:20),  
        gridCols: 20,
        gridColor: "#333",
        
        // Styling definitions for the graph and labels
        dotSize: (shortTerm? 15:4),         // normal radius for the data point circle
        dotSizeSelected: (shortTerm? 18:6), // radius for when the data point is selected (hovered over)
        blanketSize: (shortTerm? 30:20),    // hover area diameter (invisible)
        showDotLabel: shortTerm,    // flag for displaying the percentile within the data circle
        colorS: "hsb(.6, .5, 1)",   // systolic pressure line color
        colorD: "hsb(.5, .5, 1)",   // diastolic pressure line color
        txt: {font: '12px Helvetica, Arial', fill: "#fff"},  // Styling for the popup label data
        txt1: {font: '10px Helvetica, Arial', fill: "#aaa"},  // Styling for the popup label heading
        txt2: {font: '10px Helvetica, Arial', fill: "#fff"},  // Axis labels styling
        txt3: {font: '12px Helvetica, Arial', fill: "#666"},  // Styling for the popup label line headers
        
        // Y axis definitions
        max: (shortTerm? 160:100),  // maximum value of the data (plotted on the Y axis); this is either mmHg or percentile
        vLabels: (shortTerm? 8:10), // number of labels to display for the Y axis
        vAxisLabel: (shortTerm? "mmHg":(systolic?"Percentile":null)), // text to be displayed as the units label
        
        // Date format
        dateFormat: "dd MMM yyyy"
        //dateFormat: "MM / dd / yyyy"
    };
};

/**
* Returns the percentile interpretation zones data and styling
*
* @returns {Object} Zones object
*/
var getZoneData = function (){
    // IMPORTANT: Percents should sum up to 100
    return [{definition:"Hypotension (< 1%)",      percent: 1,  colorhue: .7,  opacity: .4},
            {definition:"Pre-hypotension (< 5%)",  percent: 4,  colorhue: .9, opacity: .3},
            {definition:"Normal",           percent: 85, colorhue: .3, opacity: .2},
            {definition:"Pre-hypertension (> 90%)", percent: 5,  colorhue: .1, opacity: .3},
            {definition:"Hypertension (> 95%)",     percent: 5,  colorhue: 0,  opacity: .4}]; 
};

/**
* Returns a sample patient data object
*
* @returns {Object} Patient object
*/
var getSamplePatient = function () {
    var patient = new Patient ("Jane Doe", "1994-03-27", "female");
    patient.data =
      [{timestamp: "1998-04-01T04:32:00Z", height: 85, systolic: 98, diastolic: 73, site: "Arm", position: "Standing", method: "Auscultation", encounter: "Inpatient"},
       {timestamp: "1999-05-25T06:21:00Z", height: 96, systolic: 82, diastolic: 53, site: "Leg", position: "Sitting", method: "Auscultation", encounter: "Ambulatory"},
       {timestamp: "2000-01-12T15:30:00Z", height: 116, systolic: 84, diastolic: 48, site: "Arm", position: "Sitting", method: "Auscultation", encounter: "Ambulatory"},
       {timestamp: "2000-04-24T19:13:00Z", height: 118, systolic: 104, diastolic: 52, site: "Leg", position: "Sitting", method: "Auscultation", encounter: "Ambulatory"},
       {timestamp: "2001-06-30T08:43:00Z", height: 125, systolic: 107, diastolic: 75, site: "Arm", position: "Standing", method: "Machine", encounter: "Inpatient"},
       {timestamp: "2007-12-04T14:07:00Z", height: 175, systolic: 118, diastolic: 66, site: "Leg", position: "Sitting", method: "Machine", encounter: "Inpatient"},
       {timestamp: "2011-08-26T10:24:00Z", height: 182, systolic: 109, diastolic: 74, site: "Leg", position: "Standing", method: "Machine", encounter: "Inpatient"}];
    return patient;
};

/**
* Returns a sample filter settings object
*
* @returns {Object} Filter settings object
*/
var getSampleFilterSettings = function () {
    return {
        longView: {encounter: ["Inpatient","Ambulatory"],
                   site: ["Arm","Leg"],
                   position: ["Sitting","Standing"],
                   method: ["Auscultation","Machine"],
                   dateFrom: "1980-01-01",
                   dateTo: "2019-01-01"}
    };
};

/**
* Resolves term codes to simple labels for use within the BPC app
*
* @param {String} termCode The URL of the term code to be resolved
*
* @returns {String} The term label or unknown value
*/
var getTermLabel = function (termCode) {
    var prefixSmart = "http://smartplatforms.org/terms/code/";
    var prefixSnomed = "http://www.ihtsdo.org/snomed-ct/concepts/";
    
    if (termCode == prefixSmart + "encounterType#ambulatory") return "Ambulatory";
    else if (termCode == prefixSmart + "encounterType#inpatient") return "Inpatient";
    else if (termCode == prefixSnomed + "33586001") return "Sitting";
    else if (termCode == prefixSnomed + "61396006") return "Left Leg";
    else if (termCode == prefixSnomed + "11207009") return "Right Leg";
    else if (termCode == prefixSnomed + "368208006") return "Left Arm";
    else if (termCode == prefixSnomed + "368209003") return "Right Arm";
    else if (termCode == prefixSmart + "bloodPressureMethod#auscultation") return "Auscultation";
    else if (termCode == prefixSmart + "bloodPressureMethod#machine") return "Machine";
};