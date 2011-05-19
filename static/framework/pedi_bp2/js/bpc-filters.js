// Filters and filter handlers for the BPC app
//
// Author: Nikolai Schwertner
// Revision history:
//     2011-05-19 Restructured filter loaders to reduce code duplication
//     2011-05-18 Initial split from main code

// Global filter settings holder
var filterSettings = getSampleFilterSettings (); 

/**
* Event handler for the long term view toggle filter buttons
*/
var updateFiltersLong = function () {
    loadFilterSettingsLong ();
    redrawViewLong (patient,zone);
};

/**
* Event handler for the table term view toggle filter buttons
*/
var updateFiltersTable = function () {
    loadFilterSettingsTable ();
    redrawViewTable (patient);
};

/**
* Wrapper for loading the new toggle button filter settings in the long term view
*/
var loadFilterSettingsLong = function () {
    loadFilterSettings (filterSettings.longView, "Long");
};

/**
* Wrapper for loading the new toggle button filter settings in the table view
*/
var loadFilterSettingsTable = function () {
    loadFilterSettings (filterSettings.tableView, "Table");
};

/**
* Generalized filter settings loader
*
* @param {Object} settingsObj The filter settings object branch to be updated
* @param {String} checkboxSuffix The suffix used in the html for the checkboxes set ("Long", "Table", etc)
*/
var loadFilterSettings = function (settingsObj, checkboxSuffix) {
    settingsObj.encounter = [];
    settingsObj.site = [];
    settingsObj.position = [];
    if ($("#chk"+checkboxSuffix+"Inpatient").attr("checked")) settingsObj.encounter.push("Inpatient");
    if ($("#chk"+checkboxSuffix+"Ambulatory").attr("checked")) settingsObj.encounter.push("Ambulatory");
    if ($("#chk"+checkboxSuffix+"Arm").attr("checked")) settingsObj.site.push("Arm");
    if ($("#chk"+checkboxSuffix+"Leg").attr("checked")) settingsObj.site.push("Leg");
    if ($("#chk"+checkboxSuffix+"Sitting").attr("checked")) settingsObj.position.push("Sitting");
    if ($("#chk"+checkboxSuffix+"Standing").attr("checked")) settingsObj.position.push("Standing");
};

/**
* Event handler for the long term view date range slider
*
* @param {Integer} valueFrom The from value of the slider (0-100)
* @param {Integer} valueTo The to value of the slider (0-100)
*/
var updateDateRangeLong = function (valueFrom,valueTo) {
    setDateRangeLong (valueFrom,valueTo);
    redrawViewLong (patient,zone);
};

/**
* Event handler for the table view date range slider
*
* @param {Integer} valueFrom The from value of the slider (0-100)
* @param {Integer} valueTo The to value of the slider (0-100)
*/
var updateDateRangeTable = function (valueFrom,valueTo) {
    setDateRangeTable (valueFrom,valueTo);
    redrawViewTable (patient);
};

/**
* Updates the slider label and filter settings for the long term view
*
* @param {Integer} valueFrom The from value of the slider (0-100)
* @param {Integer} valueTo The to value of the slider (0-100)
*/
var setDateRangeLong = function (valueFrom, valueTo) {
    setDateRange (valueFrom, valueTo, filterSettings.longView, "label-range-long");
};

/**
* Updates the slider label and filter settings for the table view
*
* @param {Integer} valueFrom The from value of the slider (0-100)
* @param {Integer} valueTo The to value of the slider (0-100)
*/
var setDateRangeTable = function (valueFrom, valueTo) {
    setDateRange (valueFrom, valueTo, filterSettings.tableView, "label-range-table");
};

/**
* Generalized updater for a slider label and filter settings
*
* @param {Integer} valueFrom The from value of the slider (0-100)
* @param {Integer} valueTo The to value of the slider (0-100)
* @param {Object} settingsObj The filter settings object branch to be updated
* @param {String} divID The ID attribute of the slider's label div tag
*/
var setDateRange = function (valueFrom, valueTo, settingsObj, divID) {

    // Get the date range for the current patient object
    var startTime = patient.startUnixTime,
        endTime = patient.endUnixTime;
        
    // Convert the slider values to unix dates
    var fromTime = scale (valueFrom, 0, 100, startTime, endTime),
        toTime = scale (valueTo, 0, 100, startTime, endTime);
    
    // Convert the values to the standard format and update the settings
    settingsObj.dateFrom = parse_date(fromTime).toString('yyyy-MM-dd');
    settingsObj.dateTo = parse_date(toTime).toString('yyyy-MM-dd');
    
    // Convert the slider range dates to the display format
    fromTime = parse_date(fromTime).toString('dd MMM yyyy');
    toTime = parse_date(toTime).toString('dd MMM yyyy');
    
    // Update the slider label
    $( "#" + divID ).text( fromTime + " - " + toTime );
};

/**
* Filter plugin functions for the various toggle filters
*
* @param {Object} record The patient data record to be processed
*
* @returns {Boolean} True if the patient data record is allowed through the filter
*/
var filterLongEncounter = function (record) {
    return inList (record.encounter, filterSettings.longView.encounter);
};
    
var filterLongSite = function (record) {
    return inList (record.site, filterSettings.longView.site);
};
    
var filterLongPosition = function (record) {
    return inList (record.position, filterSettings.longView.position);
};

var filterTableEncounter = function (record) {
    return inList (record.encounter, filterSettings.tableView.encounter);
};
    
var filterTableSite = function (record) {
    return inList (record.site, filterSettings.tableView.site);
};
    
var filterTablePosition = function (record) {
    return inList (record.position, filterSettings.tableView.position);
};

/**
* Filter plugin functions for the date range filters
*
* @param {Object} record The patient data record to be processed
*
* @returns {Boolean} True if the patient data record is allowed through the filter
*/
var filterLongDate = function (record) {
    var date = parse_date(record.unixTime).toString('yyyy-MM-dd');
    return filterSettings.longView.dateFrom <= date && date <= filterSettings.longView.dateTo;
};

var filterTableDate = function (record) {
    var date = parse_date(record.unixTime).toString('yyyy-MM-dd');
    return filterSettings.tableView.dateFrom <= date && date <= filterSettings.tableView.dateTo;
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
* Wrapper for applying all filters for the lont term view on a patient object
*
* @param {Object} patient The patient object to be run through the filters
*
* @returns {Object} A new patient object resulting from the filters application
*/
var applyLongFilters = function (patient) {
    return patient.applyFilter(filterLongEncounter)
                  .applyFilter(filterLongSite)
                  .applyFilter(filterLongPosition)
                  .applyFilter(filterLongDate);
};

/**
* Wrapper for applying all filters for the table view on a patient object
*
* @param {Object} patient The patient object to be run through the filters
*
* @returns {Object} A new patient object resulting from the filters application
*/
var applyTableFilters = function (patient) {
    return patient.applyFilter(filterTableEncounter)
                  .applyFilter(filterTableSite)
                  .applyFilter(filterTablePosition)
                  .applyFilter(filterTableDate);
};