/**
 * Scripts for the print view
 * Vladimir Ignatov
 */

// Initialize the BPC global obeject as needed
var BPC;
if (!BPC) {
	BPC = {};
}

jQuery(function($) {
	
	Raphael.el.crisp = function() {
		this[0].style.shapeRendering = "crispedges";
	};
	
	// Configuration constants
	// =========================================================================
	var FONT_FAMILY  = "Calibri, Tahoma, sans-serif",
		FONT_SIZE    = 12,
		COLOR_GREY_0 = "#222222",
		COLOR_GREY_1 = "#515151",
		COLOR_GREY_2 = "#636363",
		COLOR_GREY_3 = "#787878",
		COLOR_GREY_4 = "#929292",
		COLOR_GREY_5 = "#c8c8c8",
		COLOR_GREY_6 = "#d6d6d6",
		COLOR_GREY_7 = "#e3e3e3",
		COLOR_WHITE  = "#FFFFFF";
		
	// GRAPHS
	// =========================================================================
	// Settings for the long term view (which gets split in two parallel graphs)
	var LT_HEIGHT = 420,
		LT_TOP_GUTTER = 30,
		LT_BOTTOM_GUTTER = 70,
		splitHeight,
		systolic = true;
	
	// The height of each individual graph content area in the long term view
	splitHeight = Math.round( (LT_HEIGHT - LT_TOP_GUTTER - LT_BOTTOM_GUTTER)/2 );
	
	var PrintSettings = {
		
		// Basic settings all the graphs
		GraphsCommonSettings : {
			
			// dimensions for the drawing area (in pixels)
			width : 760,
			height: LT_HEIGHT,
			
			// margins to be left around the main grid (for labels etc)
			leftgutter  : 40, 
			rightgutter : 40,
			bottomgutter: LT_BOTTOM_GUTTER,
			topgutter   : LT_TOP_GUTTER,
			
			// parameters for the graph's background grid
			gridRows : 20,  
			gridCols : 20,
			gridColor: "#CCC",
			
			// Styling definitions for the graph and labels
			dotSize: 4,         // normal radius for the data point circle
			dotSizeSelected: 6, // radius for when the data point is selected (hovered over)
			blanketSize: 20,    // hover area diameter (invisible)
			showDotLabel: false,    // flag for displaying the percentile within the data circle
			colorS: "hsb(.6, 0.5, 1)",   // systolic pressure line color
			colorD: "hsb(.5, 0.5, 1)",   // diastolic pressure line color
			colorhueDefault: 0.9,          // default colorhue for datapoints when no percentile data is available
			txt: {font: '12px Helvetica, Arial', fill: "#ccc"},  // Styling for the popup label data
			txt1: {font: '10px Helvetica, Arial', fill: "#aaa"},  // Styling for the popup label heading
			txt2: {font: '10px Helvetica, Arial', fill: "#666"},  // Axis labels styling
			txt3: {font: '12px Helvetica, Arial', fill: "#666"},  // Styling for the popup label line headers
			
			// X axis definitons
			minDX: 30,  // minimum spacing between each two consecutive labels
			
			// Y axis definitions
			max: 100,  // maximum value of the data (plotted on the Y axis); this is either mmHg or percentile
			vLabels: 10, // number of labels to display for the Y axis
			vAxisLabel: "",// text to be displayed as the units label
			
			// Legend settings
			//txt4: {font: '14px Times New Roman', "font-weight": "bold", "font-style": "italic", fill: "#555"},  // the legend "i" icon text style
			txt5: {font: '12px Helvetica, Arial', fill: "#555", "font-weight": "bold"},  // the legend title text style
			txt6: {font: '10px Helvetica, Arial', fill: "#ccc", "text-anchor": "start"}, // the legend items text style
			legendWidth: 160,
			legendHeightEmpty: 34,   // the legend height when there are no items to display
			legendItemHeight: 24,
			
			// Date format
			dateFormat: "dd MMM yy",
			
			// Default zone abbreviation and label
			abbreviationDefault: "-",
			labelDefault: "N/A"
		},
		
		// Settings for the short-view graph (extends GraphsCommonSettings)
		ShortView : {
			width          : 360,
			height         : 260,
			topgutter      : FONT_SIZE * 1.5 + 1, // enough to contain a circle at 100%
			leftgutter     : 30, 
			rightgutter    : 0,
			bottomgutter   : 50,
			leftpadding    : 25, 
			rightpadding   : 25,
			gridRows       : 16, 
			gridCols       : 0, 
			max            : 160, // maximum value of the data (plotted on the Y axis); this is either mmHg or percentile
			vLabels        : 16,  // number of labels to display for the Y axis
			
			// data circles
			dotAttr : {
				r : FONT_SIZE * 1.4, 
				fill : COLOR_WHITE,
				stroke : COLOR_GREY_3,
				"stroke-width" : 1.1
			},
			
			// data labels inside the circles
			dotLabelAttr : {
				"font-size" : FONT_SIZE,
				"font-family" : FONT_FAMILY,
				fill : COLOR_GREY_1,
				"font-weight" : "bold"
			},
			
			// Y axis labels
			VAxisLabelsAttr : {
				"font-size" : FONT_SIZE * 0.82,
				"font-family" : FONT_FAMILY,
				fill : COLOR_GREY_3
			}
		},
		
		// Settings for the long-view graph (extends GraphsCommonSettings)
		LongView  : {
			
			// data circles
			dotAttr : {
				r : 5, 
				fill : COLOR_WHITE,
				stroke : COLOR_GREY_3,
				"stroke-width" : 1.2
			}
			
		}
	};
	
	
	/**
	 * Graph - The base class for graphs.
	 * @constructor
	 * @abstract
	 * ---------------------------------------------------------------------- */
	function Graph() {}
	
	Graph.prototype = {
		
		/**
		 * The Raphael paper for this graph.
		 */
		paper : null,
		
		/**
		 * Initializes the graph (stores a ref. to the container as property, 
		 * creates a paper etc.)
		 * @param {String CSS selector | DOMElement | jQuery } container 
		 */
		init : function( container, settings ) {
			if (!this._initialized) {
				this._initialized = true;
				this.container = $(container);
				this.settings = this.getSettings(settings);
				
				this.paper = Raphael(
					this.container[0], 
					this.settings.width, 
					this.settings.height
				);
				
				this.plotRect = {
					top    : this.settings.topgutter,
					right  : this.settings.rightgutter,
					bottom : this.settings.bottomgutter,
					left   : this.settings.leftgutter,
					width  : this.settings.width - 
							 this.settings.leftgutter - 
							 this.settings.rightgutter,
					height : this.settings.height - 
							 this.settings.topgutter - 
							 this.settings.bottomgutter
				};
			}
			return this;
		},
		
		/**
		 * Each subclass can extend this method to change it's settings. The 
		 * output must be an object that is going to be merged with the base 
		 * settings from PrintSettings.GraphsCommonSettings.
		 * @returns Object
		 */
		getSettings : function(customSettings) {
			if (!this.settings) {
				this.settings = $.extend(
					true, 
					{}, 
					PrintSettings.GraphsCommonSettings, 
					customSettings
				);
			}
			return this.settings;
		},
		
		/**
		 * Clears the paper for this graph. Subclasses might extend this to also
		 * free some additional resources at this point.
		 */
		clear : function() {
			this.paper.clear();
		},
		
		/**
		 * The main drawing method. Computes some common stuff and calls other 
		 * drawing methods to render specific things on the graph.
		 * @param {BPC.Patient} patient
		 */
		draw : function(patient) {
			var s     = this.settings,
				inst  = this,
				stepY = (s.height - s.bottomgutter - s.topgutter) / s.max;  // The Y distance per percentile;
			
			//this.paper.rect( 0, 0, s.width, s.height ).attr({
			//	fill : "none",
			//	"stroke-dasharray": "- ",
			//	"stroke" : COLOR_GREY_5
			//});
			
			this.drawGrid(patient);
			this.drawXAxis();
			this.drawYAxis();
			
			// Build the line graph and draw the data points
			for (var i = 0, ii = patient.data.length; i < ii; i++) {
				// Calculate the x coordinate for this data point
                var x, dx;
                if (ii === 1) {
                    dx = (s.width - s.leftgutter - s.rightgutter - s.leftpadding - s.rightpadding) / 2;
                } else {
                    dx = i * (s.width - s.leftgutter - s.rightgutter - s.leftpadding - s.rightpadding) / (ii-1);
                    
                    dx = ((s.width - s.leftgutter - s.rightgutter - s.leftpadding - s.rightpadding) / (ii));
                }
                x = Math.round (s.leftgutter + s.leftpadding + dx * i +  dx * 0.5);
                
                
                
                
                this.drawRecord(patient.data[i], x);
                
                // Draw the corresponding date text label beneath the X axis
                this.paper.text(x, s.height - 30, patient.data[i].date).attr(s.txt2).toBack();
			}
		},
		
		/**
		 * Render single record from the patient's data. Basically this means to
		 * draw two data circles for the systolic and diastolic values.
		 */
		drawRecord : function(rec, x) {
			var stepY = this.plotRect.height / this.settings.max,
				yD    = Math.round(this.settings.height - this.settings.bottomgutter - stepY * rec.diastolic),
				yS    = Math.round(this.settings.height - this.settings.bottomgutter - stepY * rec.systolic );
			
			this.drawDot(x, yD, rec.dPercentile, rec.dAbbreviation);
			this.drawDot(x, yS, rec.sPercentile, rec.dAbbreviation);
		},
		
		/**
		 * Draws one data circle 
		 */
		drawDot : function (x, y) {
			this.paper.circle(x, y, 0).attr(this.settings.dotAttr);
		},
		
		/**
		 * Implement this in subclasses to draw  a grid
		 */
		drawGrid : function() {},
		
		/**
		 * Implement this in subclasses to draw the X axis(es)
		 */
		drawXAxis : function() {},
		
		/**
		 * Implement this in subclasses to draw the Y axis(es)
		 */
		drawYAxis : function() {}
	};
	
	/**
	 * ShortGraph
	 * @constructor
	 * @param {String CSS selector | DOMElement | jQuery } container 
	 * ---------------------------------------------------------------------- */
	function ShortGraph(container) {
		this.init(container);
	}
	
	ShortGraph.prototype = new Graph();
	
	ShortGraph.prototype.getSettings = function() {
		return Graph.prototype.getSettings.call(this, PrintSettings.ShortView); 
	};
	
	ShortGraph.prototype.drawGrid = function(patient) {
		this.paper.drawGrid(
			this.settings.leftgutter, 
			this.settings.topgutter, 
			this.paper.width  - this.settings.leftgutter - this.settings.rightgutter, //s.width - s.leftgutter - s.rightgutter, 
			this.paper.height - this.settings.topgutter  - this.settings.bottomgutter, //s.height - s.topgutter - s.bottomgutter, 
			this.settings.gridCols, 
			this.settings.gridRows, 
			this.settings.gridColor, 
			true, //shortTerm, 
			patient.getDataType(), //patientType, 
			200 // transitionX
		);
	};
	
	ShortGraph.prototype.drawXAxis = function() {
		this.paper.path(
			"M" + [this.settings.leftgutter, this.settings.height - this.settings.bottomgutter] + " " + 
			"h" + (this.settings.width  - this.settings.leftgutter - this.settings.rightgutter)
		).attr({
			stroke : COLOR_GREY_3
		}).crisp();
	};
	
	ShortGraph.prototype.drawYAxis = function() {
		this.paper.path(
			"M" + [this.settings.leftgutter, 0] + " " + 
			"v" + (this.settings.height - this.settings.bottomgutter)
		).attr({
			stroke : COLOR_GREY_3
		}).crisp();
		
		// Draw the percentiles axis (needs to be reworked as a function and tested for correct scaling)
		this.paper.drawVAxisLabels(
			this.settings.leftgutter - 15, 
			this.settings.topgutter,
			this.plotRect.height, 
			this.settings.vLabels, 
			this.settings.max, 
			this.settings.vAxisLabel, 
			this.settings.VAxisLabelsAttr, 
			true // shortTerm
		);
	};
	
	ShortGraph.prototype.draw = function(patient) {
		Graph.prototype.draw.apply(this, arguments);
		drawTable( "#short-table-view", patient );
	};
	
	/**
	 * Draws one data circle. 
	 * Overrides the base method to also draw the label inside the circle.
	 * @param {Number} x
	 * @param {Number} y
	 * @param {Number} percentile
	 * @param {Number} abbreviation
	 */
	ShortGraph.prototype.drawDot = function (x, y, percentile, abbreviation) {
		var labelText = this.settings.abbreviationDefault;
		if (abbreviation) {
			labelText = abbreviation;
		} else if (percentile) {
			labelText = percentile + "%";
		}
		
		this.paper.circle(x, y, 0).attr(this.settings.dotAttr);
		this.paper.text(x, y, labelText).attr(this.settings.dotLabelAttr).toFront();
	};
	
	/**
	 * Render single record from the patient's data. 
	 * Overrides the base method to also draw a connecting line between the two 
	 * circles.
	 */
	ShortGraph.prototype.drawRecord = function(rec, x) {
		
		// Draw the vertical line connecting the pair of dots (short term view)
		var s     = this.settings,
			stepY = this.plotRect.height / s.max,
			y1    = Math.round(s.height - s.bottomgutter - stepY * rec.diastolic);
			y2    = Math.round(s.height - s.bottomgutter - stepY * rec.systolic );
		
		this.paper.path ("M" + x + " " + y1 + "L" + x + " " + y2).attr({
			stroke : this.settings.dotAttr.stroke, 
			"stroke-width": Math.max(Math.floor(this.settings.dotAttr["stroke-width"]), 1), 
			"stroke-linejoin": "round"
		}).crisp();
		
		Graph.prototype.drawRecord.call(this, rec, x);
	};
	
	////////////////////////////////////////////////////////////////////////////
	
	/**
	 * LongGraph
	 * @constructor
	 * @param {String CSS selector | DOMElement | jQuery } container 
	 * ---------------------------------------------------------------------- */
	function LongGraph(container) {
		this.init(container);
	}
	
	LongGraph.prototype = new Graph();
	
	LongGraph.prototype.getCustomSettings = function() {
		return Graph.prototype.getSettings.call(this, PrintSettings.LongView);
	};
	
	LongGraph.prototype.drawGrid = function(patient) {
		//var splitHeight = Math.round( (this.settings.height - this.settings.topgutter - this.settings.bottomgutter)/2 );
        //var bottomgutter2 = this.settings.bottomgutter - 5,
		//	topgutter2 = splitHeight + this.settings.topgutter + 5;
		//	
		//var bottomgutter = this.settings.height - this.settings.topgutter - splitHeight;
		
		var height = (this.settings.height - this.settings.topgutter  - this.settings.bottomgutter) / 2,
			width  =  this.settings.width  - this.settings.leftgutter - this.settings.rightgutter;
		
		// TODO
		var transitionX = 200;
		var patientType = patient.getDataType();
		
		// Percentile interpretation zones data and styling (IMPORTANT: Percents should sum up to 100)
		var zones = [
			{ definition: "Hypotension (< 1%)"     , abbreviation: "\\/", label: "Hypotensive"    , percent: 1 , colorhue: 0.7, opacity: 0.4, dashthrough: false, saturation : 0 },
			//{ definition:"Prehypotension (< 5%)" , abbreviation: "-"  , label: "Prehypotensive" , percent: 4 , colorhue: 0.9, opacity: 0.3, dashthrough: false, saturation : 0 },
			{ definition: "Normal"                 , abbreviation: "OK" , label: "Normal"         , percent: 89, colorhue: 0.3, opacity: 0.0, dashthrough: false, saturation : 0 },
			{ definition: "Prehypertension (> 90%)", abbreviation: "^"  , label: "Prehypertensive", percent: 5 , colorhue: 0.1, opacity: 0.2, dashthrough: true , saturation : 0 },
			{ definition: "Hypertension (> 95%)"   , abbreviation: "/\\", label: "Hypertensive"   , percent: 5 , colorhue: 0  , opacity: 0.4, dashthrough: true , saturation : 0 }
		];
        
		this.paper.drawGrid(
			this.settings.leftgutter, 
			this.settings.topgutter, 
			width, 
			height, 
			this.settings.gridCols, 
			this.settings.gridRows, 
			this.settings.gridColor, 
			false, //shortTerm, 
			patientType, 
			transitionX
		);
		
		//this.paper.drawGrid(
		//	this.settings.leftgutter, 
		//	this.settings.topgutter + height + 5, 
		//	width, 
		//	height, 
		//	this.settings.gridCols, 
		//	this.settings.gridRows, 
		//	this.settings.gridColor, 
		//	false, //shortTerm, 
		//	patientType, 
		//	transitionX
		//);
		
		this.paper.drawZones(
			this.settings.leftgutter, 
			this.settings.topgutter, 
			width, 
			height, 
			zones, 
			this.settings, 
			patientType, 
			transitionX
		);
	};
	
	LongGraph.prototype.drawVAxisLabels = function() {
		// Draw the percentiles axis (needs to be reworked as a function and tested for correct scaling)
		this.paper.drawVAxisLabels(
			this.settings.leftgutter - 15, 
			this.settings.topgutter,
			this.paper.height - this.settings.topgutter - this.settings.bottomgutter, // s.height - s.topgutter - s.bottomgutter, 
			this.settings.vLabels, 
			this.settings.max, 
			this.settings.vAxisLabel, 
			{ font: '10px Helvetica, Arial', fill: "#666" }, //s.txt2, 
			false// shortTerm
		);
	};
	////////////////////////////////////////////////////////////////////////////
	
	SMART.ready(function() {
		if ( typeof SMART === "undefined" ) {
			$("#info").text("Error: SMART Connect interface not found");
		} else {
			// Fire up the SMART API calls and initialize the application asynchronously
			$.when(BPC.get_demographics(), BPC.get_vitals(0))
			 .then( function (demographics, vitals) {
				var total = vitals.total;
				BPC.initPrintApp ( BPC.processData(demographics, vitals) );
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
	});
	
	SMART.fail (function () {
		initPrintApp ( BPC.getSamplePatient(), true );
	});
	
	/**
	 * Initializes the patient object and renders everything. 
	 */
	function initPrintApp( patient, isDemo ) {
		BPC.initPatient( patient );
		console.log( patient, BPC );
		
		drawHeader( "#header", patient );
		drawShortGraph( "#short-graph", patient );
		//drawLongGraph( "#long-graph", patient );
		drawTable( "#table-view", patient );
	}
	
	/**
	 * Draws the "short-view" graph.
	 * @param {String CSS selector | DOMElement | jQuery } container 
	 * @param {Patient} patient
	 */
	function drawShortGraph( container, patient ) {
		(new ShortGraph(container)).draw(patient.recentEncounters(3));
	}
	
	/**
	 * Draws the "long-view" graph.
	 * @param {String CSS selector | DOMElement | jQuery } container 
	 * @param {Patient} patient
	 */
	function drawLongGraph( container, patient ) {
		(new LongGraph(container)).draw(patient);
	}
	
	/**
	 * Renders the header of the print doc. populating the patient name and some
	 * other general data.
	 * @param {String CSS selector | DOMElement | jQuery } container 
	 * @param {Patient} patient
	 */
	function drawHeader( container, patient ) {
		
		var lastRecord, 
			tplData = {
				date : new XDate().toString('d MMM yy h:mm'),
				name : patient.name,
				sex  : patient.sex,
				dob  : new XDate(patient.birthdate).toString('d MMM yy')
			};
		
		// Find the last height record 
		if (patient.data && patient.data.length) {
			lastRecord = $.grep(patient.data, function(record, index) {
				return !!record.height;
			}).sort(function(a, b) {
				return b.unixTime - a.unixTime;
			})[0];
			
			if (lastRecord && lastRecord.height) {
				tplData.lastHeight = lastRecord.height + "cm";
				tplData.lastHeightDate = new XDate(lastRecord.unixTime).toString('d MMM yy');
			} else {
				tplData.lastHeight = "";
				tplData.lastHeightDate = ""
			}
		}
		
		// Generate the output
		$(container).setTemplateElement("header-template").processTemplate(tplData);
	}
	
	/**
	 * Renders the "long" table at the bottom of the print doc.
	 * @param {String CSS selector | DOMElement | jQuery } container 
	 * @param {Patient} patient
	 */
	function drawTable( container, patient ) {
		
		// Apply filters 
		var p = patient.applyFilters ();
		
		// Reverse the data order
		p.data.reverse();
		
		// Generate the table output
		$(container).setTemplateElement("template").processTemplate(p);
	}
	
	
	
});