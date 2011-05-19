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
var getSettings = function (shortTerm) {
    return {
        // the id of the div tag where the graphics will live
        divID: (shortTerm? "holder_short":"holder_long"), 
        
        // dimensions for the drawing area (in pixels)
        width: 700,
        height: 400,
        
        // margins to be left around the main grid (for labels etc)
        leftgutter: (shortTerm? 80:40), 
        rightgutter: (shortTerm? 80:40),
        bottomgutter: 70,
        topgutter: 30,
        
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
        
        // Y axis definitions
        max: (shortTerm? 160:100),  // maximum value of the data (plotted on the Y axis); this is either mmHg or percentile
        vLabels: (shortTerm? 8:10), // number of labels to display for the Y axis
        vAxisLabel: (shortTerm? "mmHg":"percentile") // text to be displayed as the units label
    };
};

/**
* Returns the percentile interpretation zones data and styling
*
* @returns {Object} Zones object
*/
var getZoneData = function (){
    // IMPORTANT: Percents should sum up to 100
    return [{definition:"Hypotension",      percent: 5,  colorhue: 0,  opacity: .4},
            {definition:"Pre-hypotension",  percent: 5,  colorhue: .1, opacity: .3},
            {definition:"Normal",           percent: 80, colorhue: .3, opacity: .2},
            {definition:"Pre-hypertension", percent: 5,  colorhue: .1, opacity: .3},
            {definition:"Hypertension",     percent: 5,  colorhue: 0,  opacity: .4}]; 
};

/**
* Returns a sample patient data object
*
* @returns {Object} Patient object
*/
var getSamplePatient = function () {
    return {
        name: "Jane Doe",
        birthdate: "1994-03-27",
        sex: "female",
        // Units of measurement - height: cm, systolic: mmHg, diastolic: mmHg
        data: [{timestamp: "1998-04-01T04:32:00Z", height: 85, systolic: 98, diastolic: 73, site: "Arm", position: "Standing", encounter: "Inpatient"},
               {timestamp: "1999-05-25T06:21:00Z", height: 96, systolic: 82, diastolic: 53, site: "Leg", position: "Sitting", encounter: "Ambulatory"},
               {timestamp: "2000-01-12T15:30:00Z", height: 116, systolic: 84, diastolic: 48, site: "Arm", position: "Sitting", encounter: "Ambulatory"},
               {timestamp: "2000-04-24T19:13:00Z", height: 118, systolic: 104, diastolic: 52, site: "Leg", position: "Sitting", encounter: "Ambulatory"},
               {timestamp: "2001-06-30T08:43:00Z", height: 125, systolic: 107, diastolic: 75, site: "Arm", position: "Standing", encounter: "Inpatient"},
               {timestamp: "2007-12-04T14:07:00Z", height: 175, systolic: 118, diastolic: 66, site: "Leg", position: "Sitting", encounter: "Inpatient"},
               {timestamp: "2011-08-26T10:24:00Z", height: 182, systolic: 109, diastolic: 74, site: "Leg", position: "Standing", encounter: "Inpatient"}]
    };
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
                   dateFrom: "1980-01-01",
                   dateTo: "2019-01-01"},
        tableView: {encounter: ["Inpatient","Ambulatory"],
                   site: ["Arm","Leg"],
                   position: ["Sitting","Standing"],
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
    if (termCode == "http://smartplatforms.org/terms/code/encounterType#ambulatory") return "Ambulatory";
    else if (termCode == "http://smartplatforms.org/terms/code/encounterType#inpatient") return "Inpatient";
    else if (termCode == "http://www.ihtsdo.org/snomed-ct/concepts/33586001") return "Sitting";
    else if (termCode == "http://www.ihtsdo.org/snomed-ct/concepts/61396006") return "Leg";
    else if (termCode == "http://www.ihtsdo.org/snomed-ct/concepts/368209003") return "Arm";
};