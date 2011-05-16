/**
*  JS for drawing of the line graph for the Blood Pressure Centiles SMART Application
*
*  Author: Nikolai Schwertner
*  Revision history:
*       2011-05-10  Merged the short and long term view generator code
*       2011-05-09  Added data table output; packaged the data variables into a "patient" object; added short-term view
*       2011-05-06  Refactored the code to improve reusability; Added zone abstraction engine; Fixed scaling issues
*
*    TO DO:
*       [X] Add short-term and table views
*       [ ] Add filters
*       [ ] Integrate with SMART
*       [ ] Test and revise
*/

var r_short, r_long;

var setDateRangeLong = function (valueFrom,valueTo) {
    var startTime = patient.startUnixTime,
        endTime = patient.endUnixTime;
    var fromTime = scale (valueFrom, 0, 100, startTime, endTime),
        toTime = scale (valueTo, 0, 100, startTime, endTime);
    
    // Convert to the standard format
    filterSettings.longView.dateFrom = parse_date(fromTime).toString('yyyy-MM-dd');
    filterSettings.longView.dateTo = parse_date(toTime).toString('yyyy-MM-dd');
    
    // Convert to the display format
    fromTime = parse_date(fromTime).toString('dd MMM yyyy');
    toTime = parse_date(toTime).toString('dd MMM yyyy');
    
    $( "#label-range-long" ).text( fromTime + " - " + toTime );
};

var updateDateRangeLong = function (valueFrom,valueTo) {
    setDateRangeLong (valueFrom,valueTo);
    updateFiltersLong();
};

var setDateRangeTable = function (valueFrom,valueTo) {
    var startTime = patient.startUnixTime,
        endTime = patient.endUnixTime;
    var fromTime = scale (valueFrom, 0, 100, startTime, endTime),
        toTime = scale (valueTo, 0, 100, startTime, endTime);
    
    // Convert to the standard format
    filterSettings.tableView.dateFrom = parse_date(fromTime).toString('yyyy-MM-dd');
    filterSettings.tableView.dateTo = parse_date(toTime).toString('yyyy-MM-dd');
    
    // Convert to the display format
    fromTime = parse_date(fromTime).toString('dd MMM yyyy');
    toTime = parse_date(toTime).toString('dd MMM yyyy');
    
    $( "#label-range-table" ).text( fromTime + " - " + toTime );
};

var updateDateRangeTable = function (valueFrom,valueTo) {
    setDateRangeTable (valueFrom,valueTo);
    updateFiltersTable();
};

var filterSettings = {
     longView: {encounter: ["Inpatient","Outpatient","Ambulatory"],
               site: ["Arm","Leg"],
               position: ["Sitting","Standing"],
               dateFrom: "1980-01-01",
               dateTo: "2019-01-01"},
    tableView: {encounter: ["Inpatient","Outpatient","Ambulatory"],
               site: ["Arm","Leg"],
               position: ["Sitting","Standing"],
               dateFrom: "1980-01-01",
               dateTo: "2019-01-01"}
};

var loadFilterDataLong = function () {
    filterSettings.longView.encounter = [];
    filterSettings.longView.site = [];
    filterSettings.longView.position = [];
    if ($("#chkLongInpatient").attr("checked")) filterSettings.longView.encounter.push("Inpatient");
    if ($("#chkLongOutpatient").attr("checked")) filterSettings.longView.encounter.push("Outpatient");
    if ($("#chkLongAmbulatory").attr("checked")) filterSettings.longView.encounter.push("Ambulatory");
    if ($("#chkLongArm").attr("checked")) filterSettings.longView.site.push("Arm");
    if ($("#chkLongLeg").attr("checked")) filterSettings.longView.site.push("Leg");
    if ($("#chkLongSitting").attr("checked")) filterSettings.longView.position.push("Sitting");
    if ($("#chkLongStanding").attr("checked")) filterSettings.longView.position.push("Standing");
};

var loadFilterDataTable = function () {
    filterSettings.tableView.encounter = [];
    filterSettings.tableView.site = [];
    filterSettings.tableView.position = [];
    if ($("#chkTableInpatient").attr("checked")) filterSettings.tableView.encounter.push("Inpatient");
    if ($("#chkTableOutpatient").attr("checked")) filterSettings.tableView.encounter.push("Outpatient");
    if ($("#chkTableAmbulatory").attr("checked")) filterSettings.tableView.encounter.push("Ambulatory");
    if ($("#chkTableArm").attr("checked")) filterSettings.tableView.site.push("Arm");
    if ($("#chkTableLeg").attr("checked")) filterSettings.tableView.site.push("Leg");
    if ($("#chkTableSitting").attr("checked")) filterSettings.tableView.position.push("Sitting");
    if ($("#chkTableStanding").attr("checked")) filterSettings.tableView.position.push("Standing");
};

var updateFiltersLong = function () {
    loadFilterDataLong ();
    drawViewsLong (patient,zone);
};

var updateFiltersTable = function () {
    loadFilterDataTable ();
    drawViewsTable (patient);
};

var inList = function (value, values) {
    for (var i = 0; i < values.length; i++) if (value == values[i]) return true;
    return false;
};
    
var filterLongEncounter = function (record) {
    return inList (record.encounter, filterSettings.longView.encounter);
};
    
var filterLongSite = function (record) {
    return inList (record.site, filterSettings.longView.site);
};
    
var filterLongPosition = function (record) {
    return inList (record.position, filterSettings.longView.position);
};

var filterLongDate = function (record) {
    var date = parse_date(record.unixTime).toString('yyyy-MM-dd');
    return filterSettings.longView.dateFrom <= date && date <= filterSettings.longView.dateTo;
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

var filterTableDate = function (record) {
    var date = parse_date(record.unixTime).toString('yyyy-MM-dd');
    return filterSettings.tableView.dateFrom <= date && date <= filterSettings.tableView.dateTo;
};

/*
var filterRandom = function (record) {
    return Math.random() > 0.2;
};
*/

// Define percentile interpretation zones (percent should sum up to 100)
var zone = [{definition:"Hypotension",      percent: 5,  colorhue: 0,  opacity: .4},
            {definition:"Pre-hypotension",  percent: 5,  colorhue: .1, opacity: .3},
            {definition:"Normal",           percent: 80, colorhue: .3, opacity: .2},
            {definition:"Pre-hypertension", percent: 5,  colorhue: .1, opacity: .3},
            {definition:"Hypertension",     percent: 5,  colorhue: 0,  opacity: .4}];
            
var patient;

$(document).ready(function() {
    // nothing to do here
}); // end document.ready handler


var initUI  = function () {
	
	// Tabs
	$('#tabs').tabs();
				
	//hover states on the static widgets
	$('#dialog_link, ul#icons li').hover(
		function() { $(this).addClass('ui-state-hover'); }, 
		function() { $(this).removeClass('ui-state-hover'); }
	);
				

    // Filter toggle buttons
    $( "#encounter_long" ).buttonset();
    $( "#site_long" ).buttonset();
    $( "#position_long" ).buttonset();
    $( "#encounter_table" ).buttonset();
    $( "#site_table" ).buttonset();
    $( "#position_table" ).buttonset();
    
    // Time filter sliders
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

var initLG = function (p) {

    patient = initPatient (p);
    
    $("#tabs").show();
    drawViews (patient,zone);
    initUI ();
}

var drawViews = function (patient, zone) {

    // Load filters
    loadFilterDataLong ();
    loadFilterDataTable ();

    // Apply filters 
    var pLong = patient.applyFilter(filterLongEncounter).applyFilter(filterLongSite).applyFilter(filterLongPosition); 
    var pTable = patient.applyFilter(filterTableEncounter).applyFilter(filterTableSite).applyFilter(filterTablePosition);

    clearGraphs();
    
    var shortTerm = true;
    drawGraph (shortTerm, patient.recentEncounters(3), zone);
    drawGraph (!shortTerm, pLong, zone);
    
    printTableView ("table_view", pTable);
};

var drawViewsLong = function (patient, zone) {
    // Apply filters 
    var p = patient.applyFilter(filterLongEncounter).applyFilter(filterLongSite).applyFilter(filterLongPosition).applyFilter(filterLongDate); 

    clearGraphsLong();
    drawGraph (false, p, zone);
};

var drawViewsTable = function (patient) {
    // Apply filters 
    var p = patient.applyFilter(filterTableEncounter).applyFilter(filterTableSite).applyFilter(filterTablePosition).applyFilter(filterTableDate); 
    printTableView ("table_view", p);
};

var initSettings = function (shortTerm) {
    // Initialize the drawing board parameters
    return {
        divID: (shortTerm? "holder_short":"holder_long"),
        width: 700,
        height: 400,
        leftgutter: (shortTerm? 80:40),
        rightgutter: (shortTerm? 80:40),
        bottomgutter: 70,
        topgutter: 30,
        leftpadding: 40,
        rightpadding: 40,
        gridRows: (shortTerm? 16:20),
        gridCols: 20,
        gridColor: "#333",
        dotSize: (shortTerm? 15:4),
        dotSizeSelected: (shortTerm? 18:6),
        blanketSize: (shortTerm? 30:20),
        showDotLabel: shortTerm,
        colorS: "hsb(.6, .5, 1)",
        colorD: "hsb(.5, .5, 1)",
        txt: {font: '12px Helvetica, Arial', fill: "#fff"},  // Styling for the popup label data
        txt1: {font: '10px Helvetica, Arial', fill: "#aaa"},  // Styling for the popup label heading
        txt2: {font: '10px Helvetica, Arial', fill: "#fff"},  // Axis labels styling
        max: (shortTerm? 160:100),  // The maximum value of the data (plotted on the Y axis); this is either mmHg or percentile
        vLabels: (shortTerm? 8:10),
        vAxisLabel: (shortTerm? "mmHg":"percentile")
    };
};

var clearGraphs = function () {
    if (r_short) r_short.clear();
    if (r_long) r_long.clear();
};

var clearGraphsLong = function () {
    if (r_long) r_long.clear();
};

var drawGraph = function (shortTerm, patient, zone) {
    var s = initSettings (shortTerm);
    
    if (!shortTerm) {
        s.startX = s.leftgutter;           // start of line graph plot
        s.endX = s.width - s.rightgutter;  // end of line graph plot
    } else {
        s.startX = s.leftgutter + s.leftpadding;            // start of line graph plot
        s.endX = s.width - s.rightgutter - s.rightpadding;  // end of line graph plot
        var dx;
        if (patient.data.length > 0) {
            dx = (patient.data.length - 1) * 70;
        } else {
            dx = 0;
        }
        s.width = dx + s.leftpadding + s.rightpadding + s.leftgutter + s.rightgutter;
        s.gridCols = patient.data.length * 3;
    }
    
    s.Y = (s.height - s.bottomgutter - s.topgutter) / s.max;  // The Y distance per percentile    
    
    if (shortTerm) r = r_short;
    else r = r_long;
    
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
            
            var y1 = Math.round(s.height - s.bottomgutter - s.Y * patient.data[i].diastolic);
            var y2 = Math.round(s.height - s.bottomgutter - s.Y * patient.data[i].systolic);
            r.path ("M" + x + " " + y1 + "L" + x + " " + y2).attr({stroke: s.colorS, "stroke-width": 3, "stroke-linejoin": "round"});
            
            // Build the two path increments for the systolic and diastolic graphs
            var pathAdvance = function (x, value, percentile) { 
                var y = Math.round(s.height - s.bottomgutter - s.Y * value);
                drawDot (x, y, percentile, patient.data[i]);  // draw the data point circle
            };
            
            pathAdvance (x, patient.data[i].diastolic, patient.data[i].dPercentile);
            pathAdvance (x, patient.data[i].systolic, patient.data[i].sPercentile);

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
    
    return r;
};

// Linear scaling function mapping a point X from the domain [x1,x2] to the range [y1,y2]
var scale = function (X, x1, x2, y1, y2) {
    if (x1 == x2) return y1 + (y2-y1)/2;
    var a = (y2-y1)/(x2-x1);
    var b = y1 - a*x1;
    return a*X + b;
};

// Draws the background grid
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

// Draws the vertical axis labels
Raphael.fn.drawVAxisLabels = function (x, y, h, hv, maxValue, axisLabel, styling) {
    var stepDelta = h / hv;
    for (var i = 0; i <= hv; i++) {
        var label = maxValue - i*(maxValue / hv);
        this.text(x, Math.round(y + i * stepDelta), label).attr(styling).toBack();
    }
    this.text(x, Math.round(y - 20), axisLabel).attr(styling).toBack();
};

// Draws the zone bands
Raphael.fn.drawZones = function (x, y, w, h, zone) {
    var dh = h / 100;   // height per percent
    
    for (var i = zone.length - 1, currentY = y; i >= 0; i--) {
        var zoneH = zone[i].percent * dh;
        this.rect(x + .5, currentY + .5, w,zoneH).attr({stroke: "none", "stroke-width": 0, fill: "hsb(" + [zone[i].colorhue, .9, .8] + ")", opacity: zone[i].opacity}).toBack();
        currentY = currentY + zoneH;
    }
};

// Returns the correct colorhue for the percentile based on the defined zones (undefined if no match)
var getDotColorhue = function (zone, percentile) {
    for (var i = 0, zoneStart=0, zoneEnd=0; i < zone.length; i++) {
        zoneEnd = zoneEnd + zone[i].percent;
        if (zoneStart <= percentile && percentile <= zoneEnd) return zone[i].colorhue;
        zoneStart = zoneEnd;
    }
    
    return .3;  // default hue for dots (never returned unless the zones don't sum up to 100%)
}

var printTableView = function (divID, patient) {
    // Table output (using jTemplates)
    $("#"+divID).setTemplateElement("template");
    $("#"+divID).processTemplate(patient);
};


// Initialize the patient data object and apply the appropriate filters to it
var initPatient = function (p) {

    // Initialize the data here (currently using the sample adata below)
    // Units of measurement... timestamp: 'yyyy-MM-ddTHH:mm:ssZ', height: cm, systolic: mmHg, diastolic: mmHg
    // Assume that the data points have been sorted by Timestamp (TO DO: add sorting function here to enforce the proper order regardles of input conditions)
    var patient = p;

    if (!patient) patient = {
        name: "Jane Doe",
        birthdate: "1994-03-27",
        sex: "female",
        data: [{timestamp: "1998-04-01T04:32:00Z", height: 85, systolic: 98, diastolic: 73, site: "Arm", position: "Standing", encounter: "Inpatient"},
               {timestamp: "1999-05-25T06:21:00Z", height: 96, systolic: 82, diastolic: 53, site: "Leg", position: "Sitting", encounter: "Outpatient"},
               {timestamp: "2000-01-12T15:30:00Z", height: 116, systolic: 84, diastolic: 48, site: "Arm", position: "Sitting", encounter: "Ambulatory"},
               {timestamp: "2000-04-24T19:13:00Z", height: 118, systolic: 104, diastolic: 52, site: "Leg", position: "Sitting", encounter: "Outpatient"},
               {timestamp: "2001-06-30T08:43:00Z", height: 125, systolic: 107, diastolic: 75, site: "Arm", position: "Standing", encounter: "Inpatient"},
               {timestamp: "2007-12-04T14:07:00Z", height: 175, systolic: 118, diastolic: 66, site: "Leg", position: "Sitting", encounter: "Outpatient"},
               {timestamp: "2011-08-26T10:24:00Z", height: 182, systolic: 109, diastolic: 74, site: "Leg", position: "Standing", encounter: "Inpatient"}]
    };
    
    // Generates a patient label
    patient.toString = function() {
        return this.name + " (" + this.sex + ", DOB: " + this.birthdate + ")";
    };
    
    // Generates a patient label
    patient.clone = function() {
        // Shallow copy //var p = jQuery.extend({}, this);
        return jQuery.extend(true, {}, this);
    };
    
    // Returns a patent with the n most recent encounters data
    patient.recentEncounters = function (n) {
        var p = this.clone();
        p.data = [];
        
        for (var i = this.data.length - 1, dateCounter = 0, lastDate; i >= 0 && dateCounter < n; i--) {
            p.data.push (this.data[i]);
            newDate = this.data[i].date;
            if (!lastDate || newDate != lastDate) {
                lastDate = newDate;
                dateCounter++;
            }
        }
        
        p.data.reverse();
        
        return p;
    }
    
     // Applies a filter to the patient object
    patient.applyFilter = function (filter) {       
        var p = this.clone();
        p.data = [];
        
        for (var i = 0; i < this.data.length; i++) {
            if (filter(this.data[i])) p.data.push (this.data[i]);
        }
        
        // The unix timestamps of the first and last encounters
        if (p.data.length > 0) {
            p.startUnixTime = p.data[0].unixTime;
            p.endUnixTime = p.data[p.data.length - 1].unixTime;
        }
        
        return p;
    };
           
    // Calculate the age and percentiles for the patient encounters
    for (var i = 0, ii = patient.data.length; i < ii; i++) {
    
        // Calculate age and percentiles
        patient.data[i].age = Math.floor( years_apart( patient.data[i].timestamp , patient.birthdate ) );       
        var percentiles = bp_percentiles ({height: patient.data[i].height / 100,   // convert height to meters from centimeters
                                           age: patient.data[i].age, 
                                           sex: patient.sex, 
                                           systolic: patient.data[i].systolic, 
                                           diastolic: patient.data[i].diastolic});
        patient.data[i].sPercentile = percentiles.systolic;
        patient.data[i].dPercentile = percentiles.diastolic;
        
        // Convert the date into the output format and standard unix timestamp
        var d = parse_date (patient.data[i].timestamp);
        patient.data[i].date = d.toString('dd MMM yyyy');
        patient.data[i].unixTime = d.getTime();
    }
        
    // The unix timestamps of the first and last encounters
    patient.startUnixTime = patient.data[0].unixTime;
    patient.endUnixTime = patient.data[patient.data.length - 1].unixTime;
        
    return patient;
};