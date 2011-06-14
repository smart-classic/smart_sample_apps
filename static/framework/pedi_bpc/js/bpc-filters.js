// Filters and filter handlers for the BPC app
//
// Author: Nikolai Schwertner
// Revision history:
//     2011-05-19 Restructured filter loaders to reduce code duplication
//     2011-05-18 Initial split from main code

// Global filter settings holder
var filterSettings = getSampleFilterSettings (); 

/**
* Event handler for the toggle filter buttons
*/
var updateFilters = function () {
    //disableControls ();
    loadFilterSettings ();
    redrawViewLong (patient,zone);
    redrawViewTable (patient);
    //enableControls ();
};

/**
* Filter settings loader
*/
var loadFilterSettings = function () {
    filterSettings.encounter = [];
    filterSettings.site = [];
    filterSettings.position = [];
    filterSettings.method = [];
    if ($("#chkFilterInpatient").attr("checked")) filterSettings.encounter.push("Inpatient");
    if ($("#chkFilterAmbulatory").attr("checked")) filterSettings.encounter.push("Ambulatory");
    if ($("#chkFilterArm").attr("checked")) filterSettings.site.push("Arm");
    if ($("#chkFilterLeg").attr("checked")) filterSettings.site.push("Leg");
    if ($("#chkFilterSitting").attr("checked")) filterSettings.position.push("Sitting");
    if ($("#chkFilterStanding").attr("checked")) filterSettings.position.push("Standing");
    if ($("#chkFilterAuscultation").attr("checked")) filterSettings.method.push("Auscultation");
    if ($("#chkFilterMachine").attr("checked")) filterSettings.method.push("Machine");
};

/**
* Event handler for the date range slider
*
* @param {Integer} valueFrom The from value of the slider (0-100)
* @param {Integer} valueTo The to value of the slider (0-100)
*/
var updateDateRange = function (valueFrom,valueTo) {
    setDateRange (valueFrom,valueTo);
    redrawViewLong (patient,zone);
    redrawViewTable (patient);

};

/**
* Updates the slider label and filter settings
*
* @param {Integer} valueFrom The from value of the slider (0-100)
* @param {Integer} valueTo The to value of the slider (0-100)
*/
var setDateRange = function (valueFrom, valueTo) {

    var s = getSettings ();

    // Get the date range for the current patient object
    var startTime = patient.startUnixTime,
        endTime = patient.endUnixTime;
        
    // Convert the slider values to unix dates
    var fromTime = scale (valueFrom, 0, 100, startTime, endTime),
        toTime = scale (valueTo, 0, 100, startTime, endTime);
    
    // Convert the values to the standard format and update the settings
    filterSettings.dateFrom = parse_date(fromTime).toString('yyyy-MM-dd');
    filterSettings.dateTo = parse_date(toTime).toString('yyyy-MM-dd');
    
    // Convert the slider range dates to the display format
    fromTime = parse_date(fromTime).toString(s.dateFormat);
    toTime = parse_date(toTime).toString(s.dateFormat);
    
    // Update the slider label
    $( "#label-timerange" ).text( fromTime + " - " + toTime );
};

/**
* Filter plugin functions for the various toggle filters
*
* @param {Object} record The patient data record to be processed
*
* @returns {Boolean} True if the patient data record is allowed through the filter
*/
var filterEncounter = function (record) {
    return inList (record.encounter, filterSettings.encounter);
};
    
var filterSite = function (record) {
    var site = record.site.toLowerCase();
    if (site.indexOf("arm") != -1) {
        return inList ("Arm", filterSettings.site);
    } else if (site.indexOf("leg") != -1) {
        return inList ("Leg", filterSettings.site);
    } else return false;
};
    
var filterPosition = function (record) {
    return inList (record.position, filterSettings.position);
};

var filterMethod = function (record) {
    return inList (record.method, filterSettings.method);
};

var filterValid = function (record) {
    return record.height && record.sPercentile && record.dPercentile;
};

/**
* Filter plugin functions for the date range filters
*
* @param {Object} record The patient data record to be processed
*
* @returns {Boolean} True if the patient data record is allowed through the filter
*/
var filterDate = function (record) {
    var date = parse_date(record.unixTime).toString('yyyy-MM-dd');
    return filterSettings.dateFrom <= date && date <= filterSettings.dateTo;
};


/**
* Utility for checking of the presence of a value within a list of values
*
* @param {String} value The target value to be searched for
* @param {String Array} values The list of values to be searched through
*
* @returns {Boolean} True if the value was found in the list of values
*/
var inList = function (value, values) {
    for (var i = 0; i < values.length; i++) if (value == values[i]) return true;
    return false;
};

/**
* Linear scaling function mapping a point X from the domain [x1,x2] to the range [y1,y2]
*
* @param {Number} X
* @param {Number} x1
* @param {Number} x2
* @param {Number} y1
* @param {Number} y2
*
* @returns {Number}
*/
var scale = function (X, x1, x2, y1, y2) {
    if (x1 == x2) return y1 + (y2-y1)/2;
    var a = (y2-y1)/(x2-x1);
    var b = y1 - a*x1;
    return a*X + b;
};

/**
* Wrapper for applying all filters to a patient object
*
* @param {Object} patient The patient object to be run through the filters
*
* @returns {Object} A new patient object resulting from the filters application
*/
var applyFilters = function (patient) {
    return patient.applyFilter(filterEncounter)
                  .applyFilter(filterSite)
                  .applyFilter(filterPosition)
                  .applyFilter(filterDate)
                  .applyFilter(filterMethod);
};
