/**
*  JS for drawing of the line graph for the Blood Pressure Centiles SMART Application
*
*  Author: Nikolai Schwertner
*  Last updated: 2011-05-06
*  Revision history:
*       2011-05-06  Refactored the code to improve reusability; Added zone abstraction engine; Fixed scaling issues
*       2011-05-09  Added data table output; packaged the data variables into a "patient" object
*
*    TO DO:
*       [ ] Add short-term and table views
*       [ ] Add filters
*       [ ] Integrate with SMART
*       [ ] Test and revise
*/

$(document).ready(function() {

    // Define percentile interpretation zones (percent should sum up to 100)
    var zone = [{definition:"Hypotension",      percent: 5,  colorhue: 0,  opacity: .4},
                {definition:"Pre-hypotension",  percent: 5,  colorhue: .1, opacity: .3},
                {definition:"Normal",           percent: 80, colorhue: .3, opacity: .2},
                {definition:"Pre-hypertension", percent: 5,  colorhue: .1, opacity: .3},
                {definition:"Hypertension",     percent: 5,  colorhue: 0,  opacity: .4}];

    // Initialize the data here (currently using the sample adata below)
    // Units of measurement... timestamp: 'yyyy-MM-ddTHH:mm:ssZ', height: cm, systolic: mmHg, diastolic: mmHg
    // Assume that the data points have been sorted by Timestamp (TO DO: add sorting function here to enforce the proper order regardles of input conditions)
    
    var patient = {
        birthdate: "1994-03-27",
        sex: "female",
        data: [{timestamp: "1998-04-01T04:32:00Z", height: 85, systolic: 98, diastolic: 73, site: "Arm", position: "Standing", encounter: "Inpatient"},
               {timestamp: "1999-05-25T06:21:00Z", height: 96, systolic: 82, diastolic: 53, site: "Leg", position: "Sitting", encounter: "Outpatient"},
               {timestamp: "2000-01-12T15:30:00Z", height: 116, systolic: 84, diastolic: 48, site: "Arm", position: "Standing", encounter: "Ambulatory"},
               {timestamp: "2000-04-24T19:13:00Z", height: 118, systolic: 104, diastolic: 52, site: "Leg", position: "Sitting", encounter: "Outpatient"},
               {timestamp: "2001-06-30T08:43:00Z", height: 125, systolic: 107, diastolic: 75, site: "Arm", position: "Standing", encounter: "Inpatient"},
               {timestamp: "2007-12-04T14:07:00Z", height: 175, systolic: 118, diastolic: 66, site: "Leg", position: "Sitting", encounter: "Outpatient"},
               {timestamp: "2011-08-26T10:24:00Z", height: 182, systolic: 109, diastolic: 74, site: "Leg", position: "Standing", encounter: "Inpatient"}]
    };
    
    // Generates a patient label
    patient.toString = function() {
        return "Patient (" + this.sex + ", DOB: " + this.birthdate + ")";
    };
        
    // These variables will hold the unix timestamps of the first and last encounters
    var startUnixTime,endUnixTime;
    
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
        
        // Initialize the first/last encounter timestamps if we have the correct data points
        if (i == 0) startUnixTime = d.getTime();
        if (i == ii - 1) endUnixTime = d.getTime();
    }
     
    // Table output (using jTemplates)
    $("#result").setTemplateElement("template");
    $("#result").processTemplate(patient);
                
    // Initialize the drawing board parameters
    var width = 700,
        height = 400,
        leftgutter = 40,
        rightgutter = 40,
        bottomgutter = 70,
        topgutter = 30,
        gridRows = 20,
        gridCols = 20,
        gridColor = "#333",
        colorS = "hsb(.6, .5, 1)",
        colorD = "hsb(.5, .5, 1)",
        txt  = {font: '12px Helvetica, Arial', fill: "#fff"},  // Styling for the popup label data
        txt1 = {font: '10px Helvetica, Arial', fill: "#aaa"},  // Styling for the popup label heading
        txt2 = {font: '10px Helvetica, Arial', fill: "#fff"},  // Axis labels styling
        startX = leftgutter,         // start of line graph plot
        endX = width - rightgutter,  // end of line graph plot
        max = 100,  // The maximum value of the percentiles data (plotted on the Y axis)
        Y = (height - bottomgutter - topgutter) / max,  // The Y distance per percentile 
        r = Raphael("holder", width, height);
        
    // Draw the grid
    r.drawGrid(leftgutter + .5, topgutter + .5, width - leftgutter - rightgutter, height - topgutter - bottomgutter, gridCols, gridRows, gridColor);
      
    // Draw the percentiles axis (needs to be reworked as a function and tested for correct scaling)
    r.drawVAxisLabels (leftgutter - 15, topgutter + .5,height - topgutter - bottomgutter, 10, txt2);
       
    // Draw the zones
    r.drawZones(leftgutter + .5, topgutter + .5, width - leftgutter - rightgutter, height - topgutter - bottomgutter, zone);
    
    // Set up drawing elements
    var pathS = r.path().attr({stroke: colorS, "stroke-width": 3, "stroke-linejoin": "round"}),
        pathD = r.path().attr({stroke: colorD, "stroke-width": 3, "stroke-linejoin": "round"}),
        label = r.set(),
        is_label_visible = false,
        leave_timer,
        blanket = r.set();

    // Initialize popup
    label.push(r.text(60, 12, "22 Sep 2008 - Inpatient").attr(txt1));
    label.push(r.text(60, 27, "BP: 96/75 mmHg (79%/63%)").attr(txt));
    label.push(r.text(60, 42, "5 year-old, 75 cm").attr(txt));
    label.push(r.text(60, 57, "Other: Arm, Sitting").attr(txt));
    label.hide();
    var frame = r.popup(100, 100, label, "right").attr({fill: "#000", stroke: "#666", "stroke-width": 2, "fill-opacity": .7}).hide();
     
    // Initialize the two path arrays (SVG path format)
    var pS = [], pD = [];
      
    // Build the line graph and draw the data points
    for (var i = 0, ii = patient.data.length; i < ii; i++) {     

        // Method for drawing a dot on the plane
        var drawDot = function (x, y, percentile, data) {
        
            // Get the correct color hue for the dot
            var colorhue = getDotColorhue (zone, percentile);

            // Draw the circle
            var dot = r.circle(x, y, 4).attr({color: "hsb(" + [colorhue, .8, 1] + ")", fill: "hsb(" + [colorhue, .5, .4] + ")", stroke: "hsb(" + [colorhue, .5, 1] + ")", "stroke-width": 2});
            
            // Generate a mouse over rectangle (invisible)
            blanket.push(r.rect(x-10, y-10, 20, 20).attr({stroke: "none", fill: "#fff", opacity: 0}));
            var rect = blanket[blanket.length - 1];
            
            // Event handlers for the mouse over zone
            var timer, i = 0;
            rect.hover(function () {
                // Reset the leave timer
                clearTimeout(leave_timer);
                
                // Display the label box
                var side = "right";
                if (x + frame.getBBox().width > width) side = "left";
                var ppp = r.popup(x, y, label, side, 1);
                var animation_duration = 200; //milliseconds
                frame.show().stop().animate({path: ppp.path}, animation_duration * is_label_visible);
                label[0].attr({text: data.date + " - " + data.encounter}).show().stop().animateWith(frame, {translation: [ppp.dx, ppp.dy]}, animation_duration * is_label_visible);
                label[1].attr({text: "BP: " + data.systolic + "/" + data.diastolic + " mmHg (" + data.sPercentile + "%/" + data.dPercentile + "%)"}).show().stop().animateWith(frame, {translation: [ppp.dx, ppp.dy]}, animation_duration * is_label_visible);
                label[2].attr({text: data.age + " year-old, " + data.height + " cm"}).show().stop().animateWith(frame, {translation: [ppp.dx, ppp.dy]}, animation_duration * is_label_visible);
                label[3].attr({text: "Other: " + data.site + ", " + data.position}).show().stop().animateWith(frame, {translation: [ppp.dx, ppp.dy]}, animation_duration * is_label_visible);
                is_label_visible = true;
                
                // Size the dot up
                dot.attr("r", 6);
            }, function () {
                // Restore the dot's original size
                dot.attr("r", 4);
                
                leave_timer = setTimeout(function () {
                    // Hide the label box
                    frame.hide();
                    for (var i = 0; i < label.length; i++) label[i].hide();
                    is_label_visible = false;
                }, 1);
            });
        };  // end drawDot method
        
        // Calculate the x coordinate for this data point
        var x = Math.round (scale (patient.data[i].unixTime,startUnixTime,endUnixTime,startX,endX));
        
        // Build the two path increments for the systolic and diastolic graphs
        var pathAdvance = function (first, x, percentile) { 
            var path = [];
            var y = Math.round(height - bottomgutter - Y * percentile);
            if (first) path = ["M", x, y];
            path = path.concat(["L", x, y]);
            drawDot (x, y, percentile, patient.data[i]);  // draw the data point circle
            return path;
        };
        pS = pS.concat (pathAdvance (!i, x, patient.data[i].sPercentile));
        pD = pD.concat (pathAdvance (!i, x, patient.data[i].dPercentile));

        // Draw the corresponding date text label beneath the X axis
        r.text(x + 15, height - 70, patient.data[i].date).attr(txt2).rotate(60).translate(0, 40).toBack();
    }
    
    // Draw the two line graphs
    pathS.attr({path: pS});
    pathD.attr({path: pD});
    
    // Bring the popup box and the mouse over triggers to the front
    frame.toFront();
    for (var i = 0; i < label.length; i++) label[i].toFront();
    blanket.toFront();
    
}); // end document.ready handler

// Linear scaling function mapping a point X from the domain [x1,x2] to the range [y1,y2]
var scale = function (X, x1, x2, y1, y2) {
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
Raphael.fn.drawVAxisLabels = function (x, y, h, hv, styling) {
    var stepDelta = h / hv;
    for (var i = 0; i <= hv; i++) {
        var label = 100 - i*(100 / hv);
        this.text(x, Math.round(y + i * stepDelta), label).attr(styling).toBack();
    }
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