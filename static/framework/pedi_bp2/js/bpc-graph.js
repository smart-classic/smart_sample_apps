// Graphics library for the Blood Pressure Centiles SMART Application
//
// Author: Nikolai Schwertner
//
// Revision history:
//       2011-05-19  Code improvements and additional inline documentation
//       2011-05-16  Added SMART integration to app
//       2011-05-13  Improved filtering at load times; Improved the presentation (axis labels, transparency); Fixed range slider issues; Removed Pop-up animation; Fixed handling of less than 3 data points
//       2011-05-12  Fixed redrawing bugs; Implemented workaround for Raphael text drawing in hidden canvas bug; Added filters and filter UI
//       2011-05-10  Merged the short and long term view generator code; Added patient name label
//       2011-05-09  Added data table output; packaged the data variables into a "patient" object; added short-term view
//       2011-05-06  Refactored the code to improve reusability; Added zone abstraction engine; Fixed scaling issues
//
//    TO DO:
//       [X] Add short-term and table views
//       [X] Add filters
//       [X] Integrate with SMART
//       [ ] Test and revise

// The canvases for the short and long term graphs
var r_short, r_long;

/**
* Document onLoad event handler (jQuery style)
*/  
$(document).ready(function() {
    // Add things to do upon document loading
}); // end document.ready handler

/**
* Initializes the BPC app with a new patient
*
* @param {Object} newPatient The new patient object
*/
var initApp = function (newPatient) {

    // Update the global patient handle
    patient = newPatient;
    
    // Initialize the patient object
    initPatient (patient);
    
    // Draw the views
    $("#tabs").show();
    drawViews (patient,zone);
    
    // Initialize the UI
    initUI ();
}

/**
* Draws all the views in the app after applying the appropriate tag filters to the patient
*
* @param {Object} patient The patient data object
* @param {Object} zone The zones object
*/
var drawViews = function (patient, zone) {

    // Load toggle filter settings from the page
    loadFilterSettingsLong ();
    loadFilterSettingsTable ();

    // Apply the tag filters 
    var pLong = applyLongFilters (patient); 
    var pTable = applyTableFilters (patient);

    // Clear the canvases
    clearGraphs();
    
    // Draw the short term view with the last 3 encounters
    drawGraph (true, patient.recentEncounters(3), zone);
    
    // Draw the long term view
    drawGraph (false, pLong, zone);
    
    // Render the table view
    printTableView ("holder_table", pTable);
};

/**
* Readraws the long term view after applying the appropriate tag filters
*
* @param {Object} patient The patient data object
* @param {Object} zone The zones object
*/
var redrawViewLong = function (patient, zone) {

    // Apply filters 
    var p = applyLongFilters (patient); 

    // Clear the long term view canvas
    clearGraphsLong();
    
    // Draw the long term view graph
    drawGraph (false, p, zone);
};

/**
* Readraws the long term view after applying the appropriate tag filters
*
* @param {Object} patient The patient data object
* @param {Object} zone The zones object
*/
var redrawViewTable = function (patient) {

    // Apply filters 
    var p = applyTableFilters (patient);
    
    // Generate the table output
    printTableView ("holder_table", p);
};

/**
* Clears both the short and long term view canvases
*/
var clearGraphs = function () {
    clearGraphsShort();
    clearGraphsLong();
};

/**
* Clears the short term view canvas
*/
var clearGraphsShort = function () {
    if (r_short) r_short.clear();
};

/**
* Clears the long term view canvas
*/
var clearGraphsLong = function () {
    if (r_long) r_long.clear();
};

/**
* Draws either the long term or the short term view graph
*
* @param {Boolean} shortTerm Flag for indicating which view to draw
* @param {Object} patient The patient data object
* @param {Object} zone The zones object
*/
var drawGraph = function (shortTerm, patient, zone) {

    var r; // handle for the drawing canvas

    // Load the appropriate settings object
    var s = getSettings (shortTerm);
    
    // Calculate some view specific settings
    if (!shortTerm) {
    
        s.startX = s.leftgutter;           // start of line graph plot
        s.endX = s.width - s.rightgutter;  // end of line graph plot
        
    } else {
    
        s.startX = s.leftgutter + s.leftpadding;            // start of line graph plot
        s.endX = s.width - s.rightgutter - s.rightpadding;  // end of line graph plot
        
        // The width of the short term view depends on the number of encounters displayed
        var dx;
        if (patient.data.length > 0) {
            dx = (patient.data.length - 1) * 70;  // spacing coefficient
        } else {
            dx = 0;
        }
        s.width = dx + s.leftpadding + s.rightpadding + s.leftgutter + s.rightgutter;
        
        // Three grid columns per encounter
        s.gridCols = patient.data.length * 3;
    }
    
    s.Y = (s.height - s.bottomgutter - s.topgutter) / s.max;  // The Y distance per percentile    
    
    // Update the local canvas handle
    if (shortTerm) r = r_short;
    else r = r_long;
    
    // If needed, construct a new canvas object
    if (!r) {
        r = Raphael(s.divID, s.width, s.height);
        if (shortTerm) r_short = r;
        else r_long = r;
    }
        
    // Draw the grid
    r.drawGrid(s.leftgutter + .5, s.topgutter + .5, s.width - s.leftgutter - s.rightgutter, s.height - s.topgutter - s.bottomgutter, s.gridCols, s.gridRows, s.gridColor);
      
    // Draw the percentiles axis (needs to be reworked as a function and tested for correct scaling)
    r.drawVAxisLabels (s.leftgutter - 15, s.topgutter + .5,s.height - s.topgutter - s.bottomgutter, s.vLabels, s.max, s.vAxisLabel, s.txt2);
       
    // Draw the zones
    if (!shortTerm) r.drawZones(s.leftgutter + .5, s.topgutter + .5, s.width - s.leftgutter - s.rightgutter, s.height - s.topgutter - s.bottomgutter, zone);
    
    // Set up drawing elements
    var pathS = r.path().attr({stroke: s.colorS, "stroke-width": 3, "stroke-linejoin": "round"}),
        pathD = r.path().attr({stroke: s.colorD, "stroke-width": 3, "stroke-linejoin": "round"}),
        label = r.set(),
        //is_label_visible = false,
        //leave_timer,
        blanket = r.set();

    // Initialize popup
    label.push(r.text(60, 12, "22 Sep 2008 - Inpatient").attr(s.txt1));
    label.push(r.text(60, 27, "BP: 96/75 mmHg (79%/63%)").attr(s.txt));
    label.push(r.text(60, 42, "5 year-old, 75 cm").attr(s.txt));
    label.push(r.text(60, 57, "Other: Arm, Sitting").attr(s.txt));
    label.hide();
    var frame = r.popup(100, 100, label, "right").attr({fill: "#000", stroke: "#666", "stroke-width": 2, "fill-opacity": .9}).hide();  
     
    // Initialize the two path arrays (SVG path format)
    var pS = [], pD = [];
      
    // Build the line graph and draw the data points
    for (var i = 0, ii = patient.data.length; i < ii; i++) {     

        // Method for drawing a dot on the plane
        var drawDot = function (x, y, percentile, data) {
        
            // Get the correct color hue for the dot
            var colorhue = getDotColorhue (zone, percentile);

            // Draw the circle
            var dot = r.circle(x, y, s.dotSize).attr({color: "hsb(" + [colorhue, .8, 1] + ")", fill: "hsb(" + [colorhue, .5, .4] + ")", stroke: "hsb(" + [colorhue, .5, 1] + ")", "stroke-width": 2});
            var dotLabel = {attr: function () {}};
            if (s.showDotLabel) dotLabel = r.text(x, y, percentile + "%").attr(s.txt2).toFront();
            
            // Generate a mouse over rectangle (invisible)
            blanket.push(r.rect(x-s.blanketSize/2, y-s.blanketSize/2, s.blanketSize, s.blanketSize).attr({stroke: "none", fill: "#fff", opacity: 0}));
            var rect = blanket[blanket.length - 1];
            
            // Event handlers for the mouse over zone
            var timer, i = 0;
            rect.hover(function () {
                // Reset the leave timer
                //clearTimeout(leave_timer);
                
                // Display the label box
                var side = "right";
                if (x + frame.getBBox().width > s.width) side = "left";
                var ppp = r.popup(x, y, label, side, 1);
                //var animation_duration = 200; //milliseconds
                frame.attr({path: ppp.path}).show();//.stop().animate({path: ppp.path}, animation_duration * is_label_visible);
                label[0].attr({text: data.date + " - " + data.encounter}).translate(ppp.dx, ppp.dy).show();//.stop().animateWith(frame, {translation: [ppp.dx, ppp.dy]}, animation_duration * is_label_visible);
                label[1].attr({text: "BP: " + data.systolic + "/" + data.diastolic + " mmHg (" + data.sPercentile + "%/" + data.dPercentile + "%)"}).translate(ppp.dx, ppp.dy).show();//.show().stop().animateWith(frame, {translation: [ppp.dx, ppp.dy]}, animation_duration * is_label_visible);
                label[2].attr({text: data.age + " year-old, " + data.height + " cm"}).translate(ppp.dx, ppp.dy).show();//.show().stop().animateWith(frame, {translation: [ppp.dx, ppp.dy]}, animation_duration * is_label_visible);
                label[3].attr({text: "Other: " + data.site + ", " + data.position}).translate(ppp.dx, ppp.dy).show();//.show().stop().animateWith(frame, {translation: [ppp.dx, ppp.dy]}, animation_duration * is_label_visible);
                //is_label_visible = true;
                
                // Size the dot up
                dot.attr("r", s.dotSizeSelected);
                if (s.showDotLabel) dotLabel.attr(s.txt);
            }, function () {
                // Restore the dot's original size
                dot.attr("r", s.dotSize);
                if (s.showDotLabel) dotLabel.attr(s.txt2);
                
               // leave_timer = setTimeout(function () {
                    // Hide the label box
                    frame.hide();
                    for (var i = 0; i < label.length; i++) label[i].hide();
                    //is_label_visible = false;
                //}, 1);
            });
        };  // end drawDot method

        if (!shortTerm) {
            // Calculate the x coordinate for this data point
            var x = Math.round (scale (patient.data[i].unixTime,patient.startUnixTime,patient.endUnixTime,s.startX,s.endX));
            
            // Build the two path increments for the systolic and diastolic graphs
            var pathAdvance = function (first, x, percentile) { 
                var path = [];
                var y = Math.round(s.height - s.bottomgutter - s.Y * percentile);
                if (first) path = ["M", x, y];
                path = path.concat(["L", x, y]);
                drawDot (x, y, percentile, patient.data[i]);  // draw the data point circle
                return path;
            };
            pS = pS.concat (pathAdvance (!i, x, patient.data[i].sPercentile));
            pD = pD.concat (pathAdvance (!i, x, patient.data[i].dPercentile));

            // Draw the corresponding date text label beneath the X axis
            r.text(x + 15, s.height - 70, patient.data[i].date).attr(s.txt2).rotate(60).translate(0, 40).toBack();
        } else {
            // Calculate the x coordinate for this data point
            var x,dx;
            if (ii == 1) {
                dx = (s.width - s.leftgutter - s.rightgutter - s.leftpadding - s.rightpadding) / 2;
            } else {
                dx = i * (s.width - s.leftgutter - s.rightgutter - s.leftpadding - s.rightpadding) / (ii-1);
            }
            x = Math.round (s.leftgutter + s.leftpadding + dx);
            
            // Draw the vertical line connecting the pair of dots (short term view)
            var y1 = Math.round(s.height - s.bottomgutter - s.Y * patient.data[i].diastolic);
            var y2 = Math.round(s.height - s.bottomgutter - s.Y * patient.data[i].systolic);
            r.path ("M" + x + " " + y1 + "L" + x + " " + y2).attr({stroke: s.colorS, "stroke-width": 3, "stroke-linejoin": "round"});
            
            // Draw the pair of circles for the blood pressure reading
            var spawnCircle = function (x, value, percentile) { 
                var y = Math.round(s.height - s.bottomgutter - s.Y * value);
                drawDot (x, y, percentile, patient.data[i]);  // draw the data point circle
            };
            spawnCircle (x, patient.data[i].diastolic, patient.data[i].dPercentile);
            spawnCircle (x, patient.data[i].systolic, patient.data[i].sPercentile);

            // Draw the corresponding date text label beneath the X axis
            r.text(x, s.height - 50, patient.data[i].date).attr(s.txt2).toBack();
        }
    }
    
    // Draw the two line graphs
    if (!shortTerm && pS.length > 0 && pD.length > 0) {
        pathS.attr({path: pS});
        pathD.attr({path: pD});
    }
    
    // Bring the popup box and the mouse over triggers to the front
    frame.toFront();
    for (var i = 0; i < label.length; i++) label[i].toFront();
    blanket.toFront();
};

/**
* Draws the background grid
*/
Raphael.fn.drawGrid = function (x, y, w, h, wv, hv, color) {
    color = color || "#000";   // default color to black
    var path = ["M", Math.round(x) + .5, Math.round(y) + .5, "L", Math.round(x + w) + .5, Math.round(y) + .5, Math.round(x + w) + .5, Math.round(y + h) + .5, Math.round(x) + .5, Math.round(y + h) + .5, Math.round(x) + .5, Math.round(y) + .5],
        rowHeight = h / hv,
        columnWidth = w / wv;
    for (var i = 1; i < hv; i++) {
        path = path.concat(["M", Math.round(x) + .5, Math.round(y + i * rowHeight) + .5, "H", Math.round(x + w) + .5]);
    }
    for (i = 1; i < wv; i++) {
        path = path.concat(["M", Math.round(x + i * columnWidth) + .5, Math.round(y) + .5, "V", Math.round(y + h) + .5]);
    }
    return this.path(path.join(",")).attr({stroke: color});
};

/**
* Draws the vertical axis labels
*/
Raphael.fn.drawVAxisLabels = function (x, y, h, hv, maxValue, axisLabel, styling) {
    var stepDelta = h / hv;
    for (var i = 0; i <= hv; i++) {
        var label = maxValue - i*(maxValue / hv);
        this.text(x, Math.round(y + i * stepDelta), label).attr(styling).toBack();
    }
    this.text(x, Math.round(y - 20), axisLabel).attr(styling).toBack();
};

/**
* Draws the zone bands
*/
Raphael.fn.drawZones = function (x, y, w, h, zone) {
    var dh = h / 100;   // height per percent
    
    for (var i = zone.length - 1, currentY = y; i >= 0; i--) {
        var zoneH = zone[i].percent * dh;
        this.rect(x + .5, currentY + .5, w,zoneH).attr({stroke: "none", "stroke-width": 0, fill: "hsb(" + [zone[i].colorhue, .9, .8] + ")", opacity: zone[i].opacity}).toBack();
        currentY = currentY + zoneH;
    }
};


/**
* Returns the correct colorhue for the percentile based on the defined zones (undefined if no match)
*
* @param {Object} zone The zones object
* @param {Integer} percentile The percentile of the reading
*
* @returns {Number} The colorhue value
*/
var getDotColorhue = function (zone, percentile) {
    for (var i = 0, zoneStart=0, zoneEnd=0; i < zone.length; i++) {
        zoneEnd = zoneEnd + zone[i].percent;
        if (zoneStart <= percentile && percentile <= zoneEnd) return zone[i].colorhue;
        zoneStart = zoneEnd;
    }
    
    return .3;  // default hue for dots (never returned unless the zones don't sum up to 100%)
}

/**
* Prints the table view using jTemplate
*
* @param {String} divID The ID of the div tag where the table is to be generated
* @param {Object} patient The patient object
*/
var printTableView = function (divID, patient) {
    // Table output (using jTemplates)
    $("#"+divID).setTemplateElement("template");
    $("#"+divID).processTemplate(patient);
};