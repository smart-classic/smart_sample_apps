// Graphics library for the Blood Pressure Centiles SMART Application
//
// Author: Nikolai Schwertner
//
// Revision history:
//       2012-01-02  Implemented custom scaling capability for the long term view
//       2011-06-06  Code refactored
//       2011-06-02  Long term view slpit in two; legent
//       2011-05-19  Code improvements and additional inline documentation
//       2011-05-16  Added SMART integration to app
//       2011-05-13  Improved filtering at load times; Improved the presentation (axis labels, transparency); Fixed range slider issues; Removed Pop-up animation; Fixed handling of less than 3 data points
//       2011-05-12  Fixed redrawing bugs; Implemented workaround for Raphael text drawing in hidden canvas bug; Added filters and filter UI
//       2011-05-10  Merged the short and long term view generator code; Added patient name label
//       2011-05-09  Added data table output; packaged the data variables into a "patient" object; added short-term view
//       2011-05-06  Refactored the code to improve reusability; Added zones abstraction engine; Fixed scaling issues
//
//    TO DO:
//       [X] Integrate with SMART
//       [ ] Clean up the drawGraph function

// Initialize the BPC global obeject as needed
var BPC;
if (!BPC) {
    BPC = {};
}

(function () {
    "use strict";
    
    // The canvases for the short and long term graphs
    var r_short,
        r_long;


    /**
    * Initializes the BPC app with a new patient
    *
    * @param {Object} newPatient The new patient object
    */
    BPC.initApp = function (patient) {
        
        var i;

        if (patient) {
            // Update the global patient handle
            BPC.patient = patient;
            
            // Initialize the patient object
            BPC.initPatient (patient);
            
            // Draw the views
            $("#tabs").show();
            BPC.drawViews (patient,BPC.zones);
            
            // Initialize the UI
            BPC.initUI ();
            
            // Find the last pre-adult data record available
            for (i = patient.data.length - 1; i >= 0; i--) {
                if (patient.data[i].age < BPC.ADULT_AGE) {
                    break;
                }
            }

            // Initialize the calculator
            if (i >= 0) {
                BPC.initCalculator ({
                           age: patient.data[i].age, 
                           sex: patient.sex, 
                           height: patient.data[i].height, 
                           systolic: patient.data[i].systolic, 
                           diastolic: patient.data[i].diastolic});
            }
        }
    }

    /**
    * Draws all the views in the app after applying the appropriate tag filters to the patient
    *
    * @param {Object} patient The patient data object
    * @param {Object} zones The zones object
    */
    BPC.drawViews = function (patient, zones) {

        var pLong;
    
        // Load toggle filter settings from the page
        BPC.loadFilterSettings ();

        // Apply the tag filters 
        pLong = patient.applyFilters (); 

        // Clear the canvases
        BPC.clearGraphs();
        
        // Draw the short term view with the last 3 encounters
        BPC.drawGraph (true, patient.recentEncounters(3), zones);
        
        // Draw the long term view
        BPC.drawGraph (false, pLong, zones, true);
        BPC.drawGraph (false, pLong, zones, false);
        
        // Reverse the data order
        pLong.data.reverse();
        
        // Render the table view
        BPC.printTableView ("holder_table", pLong);
    };

    /**
    * Readraws the long term view after applying the appropriate tag filters
    *
    * @param {Object} patient The patient data object
    * @param {Object} zones The zones object
    */
    BPC.redrawViewLong = function (patient, zones) {

        // Apply filters 
        var p = patient.applyFilters (); 

        // Clear the long term view canvas
        BPC.clearGraphsLong();
        
        // Draw the long term view graph
        BPC.drawGraph (false, p, zones, true);
        BPC.drawGraph (false, p, zones, false);
    };

    /**
    * Readraws the long term view after applying the appropriate tag filters
    *
    * @param {Object} patient The patient data object
    * @param {Object} zones The zones object
    */
    BPC.redrawViewTable = function (patient) {

        // Apply filters 
        var p = patient.applyFilters ();
        
        // Reverse the data order
        p.data.reverse();
        
        // Generate the table output
        BPC.printTableView ("holder_table", p);
    };

    /**
    * Clears both the short and long term view canvases
    */
    BPC.clearGraphs = function () {
        BPC.clearGraphsShort();
        BPC.clearGraphsLong();
    };

    /**
    * Clears the short term view canvas
    */
    BPC.clearGraphsShort = function () {
        if (r_short) r_short.clear();
    };

    /**
    * Clears the long term view canvas
    */
    BPC.clearGraphsLong = function () {
        if (r_long) r_long.clear();
    };

    // Hack method handle that enables the labels generated in the first (systolic) run of the
    // long term view to be positioned correctly with respect to the diastolic part of the long
    // term view graph. The method is generated on the first run and then executed by the second
    // run.
    var labelToFront = function () {};
    
    /**
    * Draws either the long term or the short term view graph
    *
    * @param {Boolean} shortTerm Flag for indicating which view to draw
    * @param {Object} patient The patient data object
    * @param {Object} zones The zones object
    */
    BPC.drawGraph = function (shortTerm, patient, zones, systolic) {

        var s = BPC.getViewSettings (shortTerm, systolic),
            pathS,
            pathD,
            label,
            blanket,
            legendX,
            legendY,
            legendW,
            legendH,
            frame,
            pS = [], // Initialize the two path arrays (SVG path format)
            pD = [],
            lastX,
            dx,
            r,
            i,
            ii,
            patientType = patient.getDataType(),
            transitionX = getTransitionX(patient, s);
            
        //console.log ("Type: " + patient.getDataType() + " " + getTransitionX(patient, s));

        // The filters apply for the long term view and the table view
        if (!shortTerm) {
            patient = patient.applyFilter(BPC.filterValid);
        }
        
        // Don't draw in hidden canvas (to avoid Raphael text label placement bug) (by JCM)
        if ($("#" + s.divID).is(':hidden')) {
            return;
        }
        
        // Calculate some view specific settings
        if (!shortTerm) {
        
            s.startX = s.leftgutter;           // start of line graph plot
            s.endX = s.width - s.rightgutter;  // end of line graph plot
            
        } else {
        
            s.startX = s.leftgutter + s.leftpadding;            // start of line graph plot
            s.endX = s.width - s.rightgutter - s.rightpadding;  // end of line graph plot
            
            // The width of the short term view depends on the number of encounters displayed
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
        if (shortTerm) {
            r = r_short;
        }    else {
            r = r_long;
        }
        
        // If needed, construct a new canvas object
        if (!r) {
            r = Raphael(s.divID, s.width, s.height);
            if (shortTerm) {
                r_short = r;
            } else {
                r_long = r;
            }
        }
            
        // Draw the grid
        r.drawGrid(s.leftgutter, s.topgutter, s.width - s.leftgutter - s.rightgutter, s.height - s.topgutter - s.bottomgutter, s.gridCols, s.gridRows, s.gridColor, shortTerm, patientType, transitionX);
          
        // Draw the percentiles axis (needs to be reworked as a function and tested for correct scaling)
        r.drawVAxisLabels (s.leftgutter - 15, s.topgutter,s.height - s.topgutter - s.bottomgutter, s.vLabels, s.max, s.vAxisLabel, s.txt2, shortTerm);
            
        // Draw the zones
        if (!shortTerm) r.drawZones(s.leftgutter, s.topgutter, s.width - s.leftgutter - s.rightgutter, s.height - s.topgutter - s.bottomgutter, zones, s, patientType, transitionX);
        
        // If needed draw the transition separator
        if (!shortTerm && patientType === BPC.MIXED) r.drawTransition(transitionX, s.topgutter, s.height - s.topgutter - s.bottomgutter, s, !systolic);
        
        // Set up drawing elements
        pathS = r.path().attr({stroke: s.colorS, "stroke-width": 3, "stroke-linejoin": "round"});
        pathD = r.path().attr({stroke: s.colorD, "stroke-width": 3, "stroke-linejoin": "round"});
        label = r.set();
        blanket = r.set();
        legendX = s.width - s.rightgutter - 3;
        legendY = s.height - s.bottomgutter - 3;
        legendW = s.legendWidth;
        legendH = s.legendHeightEmpty + s.legendItemHeight * zones.length;

        // Initialize popup
        label.push(r.text(20, 12, "22 Sep 2008 - Inpatient").attr(s.txt1).attr({"text-anchor":"start"}));
        label.push(r.text(45, 27, "5y 8m, 75 cm, male").attr(s.txt).attr({"text-anchor":"start"}));
        label.push(r.text(45, 42, "96/75 mmHg (79%/63%)").attr(s.txt).attr({"text-anchor":"start"}));
        label.push(r.text(45, 57, "Arm, Sitting, Auscultation").attr(s.txt).attr({"text-anchor":"start"}));
        label.push(r.text(40, 27, "Patient:").attr(s.txt3).attr({"text-anchor":"end"}));
        label.push(r.text(40, 42, "BP:").attr(s.txt3).attr({"text-anchor":"end"}));
        label.push(r.text(40, 57, "Other:").attr(s.txt3).attr({"text-anchor":"end"}));
        label.hide();
        frame = r.popup(100, 100, label, "right").attr({fill: "#000", stroke: "#666", "stroke-width": 2, "fill-opacity": .9}).hide();  
          
        // Build the line graph and draw the data points
        for (i = 0, ii = patient.data.length; i < ii; i++) {

            // Method for drawing a dot on the plane
            var drawDot = function (x, y, percentile, abbreviation, data, gender) {
            
                // Get the correct color hue for the dot
                var colorhue = getDotColorhue (zones, percentile);

                // Draw the circle
                var dot;
                if (colorhue === s.colorhueDefault) {
                    // Hack to set the default (no percentile available) color to grey
                    dot = r.circle(x, y, s.dotSize).attr({color: "hsb(" + [colorhue, 0, 1] + ")", fill: "hsb(" + [colorhue, 0, .4] + ")", stroke: "hsb(" + [colorhue, 0, 1] + ")", "stroke-width": 2});
                } else {
                    dot = r.circle(x, y, s.dotSize).attr({color: "hsb(" + [colorhue, .8, 1] + ")", fill: "hsb(" + [colorhue, .5, .4] + ")", stroke: "hsb(" + [colorhue, .5, 1] + ")", "stroke-width": 2});
                }
                
                var dotLabel = {attr: function () {}};
                if (s.showDotLabel) {
                    var labelText = s.abbreviationDefault;
                    if (abbreviation) {
                        labelText = abbreviation;
                    } else if (percentile) {
                        labelText = percentile + "%";
                    }
                    dotLabel = r.text(x, y, labelText).attr(s.txt2).toFront();
                }
                
                // Generate a mouse over rectangle (invisible)
                blanket.push(r.rect(x-s.blanketSize/2, y-s.blanketSize/2, s.blanketSize, s.blanketSize).attr({stroke: "none", fill: "#fff", opacity: 0}));
                var rect = blanket[blanket.length - 1];
                
                // Event handlers for the mouse over zone
                var timer, i = 0;
                rect.hover(function () {
                    
                    // Construct the other information string from the available metadata
                    var otherInfo = "";
                    
                    if (data.site) otherInfo += data.site;
                    if (data.position) {
                        if (otherInfo) otherInfo += ", ";
                        otherInfo += data.position;
                    }
                    if (data.method) {
                        if (otherInfo) otherInfo += ", ";
                        otherInfo += data.method;
                    }
                    if (!otherInfo) otherInfo = "none";
                    
                    // Display the label box
                    label[0].attr({text: data.date + (data.encounter?" - " + data.encounter:"") + ((data.age >= BPC.ADULT_AGE) ? " - ADULT" : "")});
                    if (data.height) label[1].attr({text: BPC.getYears(data.age) + "y " + BPC.getMonths(data.age) + "m, " + data.height + " cm, " + gender});
                    else label[1].attr({text: BPC.getYears(data.age) + "y " + BPC.getMonths(data.age) + "m, ? cm, " + gender});
                    if (data.label) {
                        label[2].attr({text: data.systolic + "/" + data.diastolic + " mmHg (" + data.label + ")"});
                    } else {
                        if (data.sPercentile && data.dPercentile) label[2].attr({text: data.systolic + "/" + data.diastolic + " mmHg (" + data.sPercentile + "%/" + data.dPercentile + "%)"});
                        else label[2].attr({text: data.systolic + "/" + data.diastolic + " mmHg"});
                    }
                    label[3].attr({text: otherInfo});
                    
                    var animation_duration = 200; //milliseconds
                    
                    // Calculate the correct side to display the popup label with respect to the dot
                    var side = "right";
                    if (x + frame.getBBox().width > s.width) {
                        if (x >= frame.getBBox().width) {
                            side = "left";
                        } else if (y >= frame.getBBox().height) {
                            side = "top";
                        } else {
                            side = "bottom";
                        }
                    }
                    
                    // Fade in the label
                    var ppp = r.popup(x, y, label, side, 1);
                    label.translate(ppp.dx, ppp.dy).attr({opacity: 0}).show().stop().animateWith(frame, {opacity: 1}, animation_duration);
                    frame.attr({path: ppp.path}).attr({opacity: 0}).show().stop().animate({opacity: 1}, animation_duration);

                    // Size the dot up
                    dot.attr("r", s.dotSizeSelected);
                    if (s.showDotLabel) dotLabel.attr(s.txt);
                    
                }, function () {
                    // Restore the dot's original size
                    dot.attr("r", s.dotSize);
                    if (s.showDotLabel) dotLabel.attr(s.txt2);
                    
                    // Hide the label box
                    frame.hide();
                    label.hide();
                });
            };  // end drawDot method

            if (!shortTerm) {
                // Calculate the x coordinate for this data point
                var x = Math.round (BPC.scale (patient.data[i].unixTime,patient.startUnixTime,patient.endUnixTime,s.startX,s.endX));
                
                // Build the two path increments for the systolic and diastolic graphs
                var pathAdvance = function (first, x, percentile, abbreviation, flag) { 
                    var path = [];
                    var y = ltv_scale(s.height - s.bottomgutter - s.Y * percentile);
                    if (first) path = ["M", x, y];
                    path = path.concat(["L", x, y]);
                    if (flag) drawDot (x, y, percentile, abbreviation, patient.data[i], patient.sex);  // draw the data point circle
                    return path;
                };
                pS = pS.concat (pathAdvance (!i, x, patient.data[i].sPercentile, patient.data[i].sAbbreviation, systolic));
                pD = pD.concat (pathAdvance (!i, x, patient.data[i].dPercentile, patient.data[i].dAbbreviation, !systolic));

                if (!systolic && (!lastX || (x - lastX) >= s.minDX)) {
                    // Draw the corresponding date text label beneath the X axis
                    r.text(x + 15, s.height - 70, patient.data[i].date).attr(s.txt2).rotate(60).translate(0, 40).toBack();
                    lastX = x;
                }
            } else {
                // Calculate the x coordinate for this data point
                var x,dx;
                if (ii === 1) {
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
                var spawnCircle = function (x, value, percentile, abbreviation) { 
                    var y = Math.round(s.height - s.bottomgutter - s.Y * value);
                    drawDot (x, y, percentile, abbreviation, patient.data[i], patient.sex);  // draw the data point circle
                };
                spawnCircle (x, patient.data[i].diastolic, patient.data[i].dPercentile, patient.data[i].dAbbreviation);
                spawnCircle (x, patient.data[i].systolic, patient.data[i].sPercentile, patient.data[i].sAbbreviation);

                // Draw the corresponding date text label beneath the X axis
                r.text(x, s.height - 50, patient.data[i].date).attr(s.txt2).toBack();
            }
        }
        
        // Draw the two line graphs
        if (!shortTerm && pS.length > 0 && pD.length > 0) {
            //if (systolic) pathS.attr({path: pS});
            //else pathD.attr({path: pD});
        }
        
        // Hack: When on the first run of the long term view drawing, generate a handler for the
        // systolic labels
        if (!shortTerm && systolic) {
            labelToFront = function () {
                frame.toFront();
                label.toFront();
                blanket.toFront();
            };
        }
            
        
        // Bring the popup box and the mouse over triggers to the front
        frame.toFront();
        label.toFront();
        blanket.toFront();
        
        // Hack: On the second run execute the handler for positioning the systolic labels
        if (!shortTerm && !systolic) {
            labelToFront();
        }
        
        // Draw the side label for the systolic and diastolic graphs in the long term view
        if (!shortTerm) {
            var mytext;
            if (systolic) mytext = "Systolic";
            else mytext = "Diastolic";
            r.text(s.width - s.rightgutter + 20, Math.round(s.topgutter + ((s.height-s.topgutter-s.bottomgutter)/2)), mytext).attr({font: '20px Helvetica, Arial', fill: "#555"}).rotate(90).toBack();
        }
        
        // Add the "help" hotspot to the short term view
        if (shortTerm) {
            var helpBlanket = r.rect (s.width-s.rightgutter-55, 13, 60, 15).attr({fill: "#fff", opacity: 0, cursor:"pointer"});
            var helpL = r.text(s.width-s.rightgutter, 20, "Help >>").attr({"text-anchor":"end"}).attr(s.txt2).attr({fill: "#555"});
            
            var animation_duration = 200; //milliseconds
            
            helpBlanket.hover(function () {
                helpL.stop().animate({fill: "#fff"}, animation_duration);
            }, function () {
                helpL.stop().animate({fill: "#555"}, animation_duration);
            });
            
            // Event handler for clicking on the help hotspot
            helpBlanket.click(function () {
            
                // The state of the help panel
                var displayed = false;
            
                return function () {
                
                    // get effect type 
                    var selectedEffect = $( "#effectType" ).val();
                    
                    if (!displayed) {
                        $( "#help-content" ).stop().show( selectedEffect, {}, 1000 );
                        helpL.attr({text:"Help <<"});
                        displayed = true;
                    } else {
                        helpL.attr({text:"Help >>"});
                        $( "#help-content" ).stop().hide( selectedEffect, {}, 1000 );
                        displayed = false;
                    }
                };
            } ());
            
            var helpTrigger = r.set();
            helpTrigger.push (helpL);
        }
        
        // Generate the legend for the short term and long term diastolic views
        if (shortTerm || (!shortTerm && !systolic)) {
            var legend = r.getLegend (legendX,legendY,zones,s);

            // Generate a mouse over rectangle (invisible)
            var legendFrame = r.rect (legendX-20, legendY-20, 20, 20, 10).attr({color: "#000", fill: "#000", stroke: "#444", "stroke-width": 2, opacity: .9})
            var legendBlanket = r.rect (legendX-20, legendY-20, 20, 20).attr({fill: "#fff", opacity: 0});
            var legendL = r.image("images/i.png", legendX-17, legendY-16, 12, 12); //r.text(legendX-10, legendY-10, "i").attr(s.txt4);
            
            // Event handlers for the mouse over zone
            var animation_duration = 200; //milliseconds
            legendBlanket.hover(function () {
                legendBlanket.attr({x: legendX-legendW, y: legendY-legendH, width: legendW, height: legendH});
                legendFrame.stop().animate({x: legendX-legendW, y: legendY-legendH, width: legendW, height: legendH, r: 10, fill: "#000", stroke: "#444"}, animation_duration);
                legend.stop().animate({opacity: 1}, animation_duration);
                legendL.stop().animate({opacity: 0}, animation_duration);
            }, function () {
                legendBlanket.attr({x: legendX-20, y: legendY-20, width: 20, height: 20});
                legendL.stop().animate({opacity: 1}, animation_duration);
                legend.stop().animate({opacity: 0}, animation_duration);;
                legendFrame.stop().animate({x: legendX-20, y: legendY-20, width: 20, height: 20, r: 10, fill: "#000", stroke: "#444"}, animation_duration);
            });

            // Position the legent on the top
            legendFrame.toFront();
            legendL.toFront();
            legend.toFront();

            // Bring the help trigger to the front
            if (helpTrigger) {
                helpTrigger.toFront();
                helpBlanket.toFront();
            }
            
            // Bring the popup box and the mouse over triggers to the front
            frame.toFront();
            label.toFront();
            blanket.toFront();
            
            // Hack: On the second run execute the handler for positioning the systolic labels
            if (!shortTerm && !systolic) {
                labelToFront();
            }
            
            // Position the legend's trigger to the front
            legendBlanket.toFront();
            
            // Display the legend while setting it to transparent
            legend.attr({opacity: 0}).show();
        }
    };

    /**
    * Draws the background grid
    */
    Raphael.fn.drawGrid = function (x, y, w, h, wv, hv, color, shortTerm, patientType, transitionX) {
        
        var path = ["M", Math.round(x), Math.round(y), "L", Math.round(x + w), Math.round(y), Math.round(x + w), Math.round(y + h), Math.round(x), Math.round(y + h), Math.round(x), Math.round(y)],
            rowHeight = h / hv,
            columnWidth = w / wv,
            i;
            
        color = color || "#000";   // default color to black
            
        if (shortTerm || patientType !== BPC.ADULT) {
            for (i = 1; i < hv; i++) {
                if (!shortTerm) {
                    if (patientType === BPC.PEDIATRIC) {
                        path = path.concat(["M", Math.round(x), Math.round(ltv_scale(y + i * rowHeight)), "H", Math.round(x + w)]);
                    } else {
                        path = path.concat(["M", Math.round(x), Math.round(ltv_scale(y + i * rowHeight)), "H", Math.round(transitionX)]);
                    }
                } else {
                    path = path.concat(["M", Math.round(x), Math.round(y + i * rowHeight), "H", Math.round(x + w)]);
                }
            }
        }
        
        if (shortTerm || patientType !== BPC.ADULT) {
            for (i = 1; i < wv; i++) {
                if (shortTerm || patientType === BPC.PEDIATRIC || (patientType === BPC.MIXED && Math.round(x + i * columnWidth) < transitionX)) {
                    path = path.concat(["M", Math.round(x + i * columnWidth), Math.round(y), "V", Math.round(y + h)]);
                }
            }
        }
        
        return this.path(path.join(",")).attr({stroke: color}).toBack();
    };

    /**
    * Draws the vertical axis labels
    */
    Raphael.fn.drawVAxisLabels = function (x, y, h, hv, maxValue, axisLabel, styling, shortTerm) {
    
        var stepDelta = h / hv,
            label,
            val,
            i;
        
        if (shortTerm) {
            for (i = 0; i <= hv; i++) {
                label = maxValue - i*(maxValue / hv);
                this.text(x, Math.round(y + i * stepDelta), label).attr(styling).toBack();
            }
        } else {
            for (i = 1; i < hv; i++) {
                val = maxValue - i*(maxValue / hv);
                if (val === 95 || (val <= 90 && (val % 10 === 0 && (val / 10) % 2 !== 0))) {
                    label = val + " %";
                    this.text(x - 5, Math.round(ltv_scale(y + i * stepDelta)), label).attr(styling).toBack();
                }
            }
        }
        
        if (axisLabel && shortTerm) {
            this.text(x, Math.round(y - 20), axisLabel).attr(styling).attr({"font-weight":"bold"}).toBack();
        }
        if (axisLabel && !shortTerm) {
            this.text(x, Math.round(y - 10), axisLabel).attr(styling).attr({"font-weight":"bold"}).toBack();
        }
    };

    /**
    * Draws the horizotal axis labels
    */
    Raphael.fn.drawHAxisLabels = function (x, y, w, wv, minDate, maxDate, styling, patientType, transitionX) {
    
        var stepDelta = w / wv,
            stepGamma = (maxDate - minDate) / wv
            label,
            i;
            
        for (i = 0; i <= wv; i++) {
            label = parse_date (minDate + i*stepGamma).toString("MMM yyyy");
            this.text(Math.round(x + i * stepDelta) + 10 , y-5, label).attr(styling).rotate(60).translate(0, 40).toBack();
        }
    };

    /**
    * Draws the zone bands
    */
    Raphael.fn.drawZones = function (x, y, w, h, zones, settings, patientType, transitionX) {
        var dh = h / 100,   // height per percent
            zoneH,
            zoneH_scaled,
            currentY,
            i,
            s = settings,
            path,
            dashed = {fill: "none", "stroke-dasharray": "- "};
        
        for (i = zones.length - 1, currentY = y; i >= 0; i--) {
        
            zoneH = zones[i].percent * dh;
            zoneH_scaled = ltv_scale_height(currentY, zoneH);
            
            // Draw the dashed grid line for the dashed zones
            if (zones[i].dashthrough) {
                if (patientType === BPC.PEDIATRIC) {
                    path = ["M", Math.round(x), ltv_scale(currentY + zoneH/2), "H", Math.round(x + w)];
                } else if (patientType === BPC.MIXED) {
                    path = ["M", Math.round(x), ltv_scale(currentY + zoneH/2), "H", Math.round(transitionX)];
                }
                
                if (path) this.path(path.join(",")).attr({stroke: s.gridColor}).attr(dashed);
            }
            
            //console.log (currentY + ":" + zoneH + "->" + ltv_scale(currentY) + ":" + zoneH_scaled);
            
            this.rect(x, ltv_scale(currentY), w, zoneH_scaled).attr({stroke: "none", "stroke-width": 0, fill: "hsb(" + [zones[i].colorhue, .9, .8] + ")", opacity: zones[i].opacity}).toBack();
            
            currentY = currentY + zoneH;
            
        }
    };
    
    /**
    * Draws the transition separator
    */
    Raphael.fn.drawTransition = function (x, y, h, s, hasLabel) {
        this.rect(x, y, 3, h).attr({stroke: "none", "stroke-width": 0, fill: "rgb(200,200,200)"});
        if (hasLabel) this.text(x + 10, s.height - 80, "ADULT").attr(s.txt2).rotate(60).translate(0, 40).toBack();
    };

    /**
    * Draws the legend content
    */
    Raphael.fn.getLegend = function (x, y, zones, settings) {
        
        var legend = this.set(),
            width = settings.legendWidth,
            height = settings.legendHeightEmpty + settings.legendItemHeight * zones.length,
            dy = settings.legendItemHeight,
            colorhue,
            i;
        
        legend.push(this.text(x - width + 35, y - height + 15, "Legend").attr(settings.txt5));
        
        for (i = zones.length - 1; i >= 0; i--) {
            colorhue = zones[i].colorhue;
            legend.push(this.circle(x - width + 20, y - height + (zones.length-i)*dy + 15, 6).attr({color: "hsb(" + [colorhue, 0.8, 1] + ")", fill: "hsb(" + [colorhue, 0.5, 0.4] + ")", stroke: "hsb(" + [colorhue, 0.5, 1] + ")", "stroke-width": 2}));
            legend.push(this.text(x - width + 36, y - height + (zones.length-i)*dy + 15, zones[i].definition).attr(settings.txt6));
        }
        
        legend.hide();
        
        return legend;
    };


    /**
    * Returns the correct colorhue for the percentile based on the defined zones (undefined if no match)
    *
    * @param {Object} zones The zones object
    * @param {Integer} percentile The percentile of the reading
    *
    * @returns {Number} The colorhue value
    */
    var getDotColorhue = function (zones, percentile) {
    
        var zoneStart,
            zoneEnd,
            i,
            s = BPC.getViewSettings(true,true);
        
        if (!percentile) return s.colorhueDefault;
            
        for (i = 0, zoneStart = 0, zoneEnd = 0; i < zones.length; i++) {
            zoneEnd = zoneEnd + zones[i].percent;
            
            if (zoneStart <= percentile && percentile <= zoneEnd) {
                return zones[i].colorhue;
            }
            
            zoneStart = zoneEnd;
        }
        
        return s.colorhueDefault;  // never returned unless the zones don't sum up to 100%
    }

    /**
    * Prints the table view using jTemplate
    *
    * @param {String} divID The ID of the div tag where the table is to be generated
    * @param {Object} patient The patient object
    */
    BPC.printTableView = function (divID, patient) {
        // Table output (using jTemplates)
        $("#"+divID).setTemplateElement("template");
        $("#"+divID).processTemplate(patient);
    };
    
    /**
    * Implements the scaling function for the long-term view graphics
    *
    * @param {Number} x The coordinate to be rescaled
    *
    * @returns {Number} The resultant scaled coordinate
    */
    var ltv_scale = function (x) {
       // 30-46-190 -> 30-100-190
       // 195-211-355 -> 195-265-355
       if (x <= 30 || x > 355)  return x;
       if (x > 30 && x <=46)    return BPC.scale(x,30,46,30,100);
       if (x > 46 && x <=190)   return BPC.scale(x,46,190,100,190);
       if (x > 190 && x <= 195) return x;
       if (x > 195 && x <=211)  return BPC.scale(x,195,211,195,265);
       if (x > 211 && x <=355)  return BPC.scale(x,211,355,265,355);
    };
    
    /**
    * Implements s height segment scaling utility for the long-term view graphics
    *
    * @param {Number} y The coordinate at the beginning of the segment
    * @param {Number} h The height of the segment
    *
    * @returns {Number} The resultant scaled height
    */
    var ltv_scale_height = function (y, h) {
        var start = ltv_scale(y),
            end = ltv_scale(y+h);
        return end-start;
    };
    
    /**
    * Computes and returns the x coordinate for the pediatric-to-adult transition
    *
    * @param {Object} patient A patient object as data source
    *
    * @returns {Number} The x coordinate of the transition. -1 if no transition
    */
    var getTransitionX = function (patient, settings) {
        var transitionUnixTime,
            d;
    
        if (patient.getDataType() !== BPC.MIXED) {
            return -1;
        } else {
            d = parse_date(patient.birthdate);
            
            //console.log ("time before:" + d.getTime());
            //console.log (d.getFullYear());
            
            d.setYear ( d.getFullYear() + BPC.ADULT_AGE );
            
            //console.log ("time after:" + d.getTime());

            transitionUnixTime = d.getTime();
            return Math.round (BPC.scale (transitionUnixTime,patient.startUnixTime,patient.endUnixTime,settings.startX,settings.endX));
        }
    };
}());