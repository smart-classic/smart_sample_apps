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
	
	// GRAPHS
	// =========================================================================
	
	var PrintSettings = {
		
		// Settings for the short-view graph (extends GraphsCommonSettings)
		ShortView : {
			//width          : 360,
			//height         : 260,
			topgutter      : BPC.Constants.FONT_SIZE * 1.5 + 1, // enough to contain a circle at 100%
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
				r : BPC.Constants.FONT_SIZE * 1.4, 
				fill : BPC.Constants.COLOR_WHITE,
				stroke : BPC.Constants.COLOR_GREY_3,
				"stroke-width" : 1.1
			},
			
			// data labels inside the circles
			dotLabelAttr : {
				"font-size" : BPC.Constants.FONT_SIZE,
				"font-family" : BPC.Constants.FONT_FAMILY,
				fill : BPC.Constants.COLOR_GREY_1,
				"font-weight" : "bold"
			},
			
			// Y axis labels
			VAxisLabelsAttr : {
				"font-size" : BPC.Constants.FONT_SIZE * 0.82,
				"font-family" : BPC.Constants.FONT_FAMILY,
				fill : BPC.Constants.COLOR_GREY_3
			}
		},
		
		// Settings for the long-view graph (extends GraphsCommonSettings)
		LongView  : {
			
			//height       : 400,
			leftgutter   : BPC.Constants.FONT_SIZE * 5, 
			rightgutter  : BPC.Constants.FONT_SIZE * 5,
			bottomgutter : BPC.Constants.FONT_SIZE * 5,
			topgutter    : 10,
			plotsMargin  : 6, // The distance between the two plots
			leftpadding  : 0, 
			rightpadding : 0,
			
			// data circles
			dotAttr : {
				r : 5, 
				fill : "none",
				stroke : BPC.Constants.COLOR_GREY_3,
				"stroke-width" : 2
			},
			dotAttrHypertensive : {
				r : 5, 
				fill : "none",
				stroke : "#000",
				"stroke-width" : 4
			},
			dotAttrPrehypertensive : {
				r : 5, 
				fill : "none",
				stroke : BPC.Constants.COLOR_GREY_1,
				"stroke-width" : 3
			},	
			
			// Y axis labels
			VAxisLabelsAttr : {
				"font-size" : BPC.Constants.FONT_SIZE * 0.92,
				"font-family" : BPC.Constants.FONT_FAMILY,
				fill : BPC.Constants.COLOR_GREY_3
			},
			
			// Y axis titles
			VAxisTitlesAttr : {
				"font-size" : BPC.Constants.FONT_SIZE * 1.2,
				"font-family" : BPC.Constants.FONT_FAMILY,
				fill : BPC.Constants.COLOR_GREY_4
			}
			
		}
	};
	
	
	
	
	/**
	 * ShortGraph
	 * @constructor
	 * @param {String CSS selector | DOMElement | jQuery } container 
	 * ---------------------------------------------------------------------- */
	function ShortGraph(container, model) {
		this.init(container, model);
	}
	
	ShortGraph.prototype = new BPC.Graph();
	
	ShortGraph.prototype.getSettings = function() {
		return BPC.Graph.prototype.getSettings.call(this, PrintSettings.ShortView); 
	};
	
	ShortGraph.prototype.drawGrid = function() {
		this.paper.drawGrid(
			this.settings.leftgutter, 
			this.settings.topgutter, 
			this.width  - this.settings.leftgutter - this.settings.rightgutter, 
			this.height - this.settings.topgutter  - this.settings.bottomgutter,
			this.settings.gridCols, 
			this.settings.gridRows, 
			this.settings.gridColor, 
			true, //shortTerm, 
			this.model.getDataType(), //patientType, 
			200 // transitionX
		);
	};
	
	ShortGraph.prototype.drawXAxis = function() {
		this.paper.path(
			"M" + [this.settings.leftgutter, this.height - this.settings.bottomgutter] + " " + 
			"h" + (this.width  - this.settings.leftgutter - this.settings.rightgutter)
		).attr({
			stroke : BPC.Constants.COLOR_GREY_3
		}).crisp();
		
		this.forEachRecord(function(rec, idx, x, all) {
			this.paper.text(x, this.height - 30, rec.date).attr(this.settings.txt2).toBack();
		});
	};
	
	ShortGraph.prototype.drawYAxis = function() {
		this.paper.path(
			"M" + [this.settings.leftgutter, 0] + " " + 
			"v" + (this.height - this.settings.bottomgutter)
		).attr({
			stroke : BPC.Constants.COLOR_GREY_3
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
	
	ShortGraph.prototype.draw = function() {
		BPC.Graph.prototype.draw.apply(this, arguments);
		drawTable( "#short-table-view", this.model, true );
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
	ShortGraph.prototype.drawRecord = function(rec, idx, x, all) {
		
		// Draw the vertical line connecting the pair of dots (short term view)
		var s     = this.settings,
			stepY = this.plotRect.height / s.max,
			y1    = Math.round(this.height - s.bottomgutter - stepY * rec.diastolic);
			y2    = Math.round(this.height - s.bottomgutter - stepY * rec.systolic );
		
		this.paper.path ("M" + x + " " + y1 + "L" + x + " " + y2).attr({
			stroke : this.settings.dotAttr.stroke, 
			"stroke-width": Math.max(Math.floor(this.settings.dotAttr["stroke-width"]), 1), 
			"stroke-linejoin": "round"
		}).crisp();
		
		BPC.Graph.prototype.drawRecord.call(this, rec, idx, x, all);
	};
	
	////////////////////////////////////////////////////////////////////////////
	
	/**
	 * LongGraph
	 * @constructor
	 * @param {String CSS selector | DOMElement | jQuery } container 
	 * ---------------------------------------------------------------------- */
	function LongGraph(container, model) {
		
		// First call the init() from the base class to initialize the base
		this.init(container, model);
		
		/**
		 * The rectangle of the systolic plot
		 */ 
		this.systolicPlotRect = new BPC.Rect(
			new BPC.Point(
				this.plotRect.left, 
				this.plotRect.top
			),
			new BPC.Point(
				this.plotRect.left + this.plotRect.width,
				this.plotRect.top  + this.plotRect.height / 2 - this.settings.plotsMargin / 2
			)
		);
		
		/**
		 * The rectangle of the diastolic plot
		 */ 
		this.diastolicPlotRect = new BPC.Rect(
			new BPC.Point(
				this.plotRect.left, 
				this.plotRect.top + this.plotRect.height / 2 + this.settings.plotsMargin / 2
			),
			new BPC.Point(
				this.plotRect.left + this.plotRect.width,
				this.plotRect.top  + this.plotRect.height
			)
		);
		
		/**
		 * The Y axis configuration
		 */ 
		this.dimesionY = [
			{ value : 0   }, 
			{ value : 10, label: "10%" },
			{ value : 20  }, 
			{ value : 30, label: "30%" },
			{ value : 40  }, 
			{ value : 50, label: "50%" },
			{ value : 60  },
			{ value : 70, label: "70%" },
			{ value : 75  },
			{ value : 80  },
			{ value : 85  },
			{ value : 90, label: "90%" },
			{ value : 91.6666666666666667 }, 
			{ value : 93.3333333333333335 },
			{ value : 95, label: "95%" },
			{ value : 96.6666666666666667 }, 
			{ value : 98.3333333333333335 },
			{ value : 100 }
        ];
        
        this.zones = [
			{
				label    : "Hypertensive",
				startPct : 95,
				endPct   : 100,
				bgColor  : "#BDBDBD"
			},
			{
				label    : "Prehypertensive",
				startPct : 90,
				endPct   : 95,
				bgColor  : "#DDD"
			},
			{
				label    : "Normal",
				startPct : 1,
				endPct   : 90,
				bgColor  : "#FFF"
			},
			{
				label    : "Hypotensive",
				startPct : 0,
				endPct   : 1,
				bgColor  : "#EEE"
			}
        ];
	}
	
	/**
	 * Inherit from BPC.Graph
	 */
	LongGraph.prototype = new BPC.Graph();
	
	LongGraph.prototype.getSettings = function() {
		return BPC.Graph.prototype.getSettings.call(this, PrintSettings.LongView);
	};
	
	/**
	 * The Y dimension of this graph is not linear, so we need a method to 
	 * convert percentiles to Y positions.
	 */
	LongGraph.prototype.pct2Y = function(pct, type) {
		var len  = this.dimesionY.length,
			rect = type == "diastolic" ? 
				this.diastolicPlotRect : 
				this.systolicPlotRect,
			step = rect.height / (len - 1),
			item, nextItem, i, dy, y = 0;
		
		for ( i = 0; i < len - 1; i++ ) {
			item = this.dimesionY[i];
			nextItem = this.dimesionY[i + 1];
			if ( pct < nextItem.value ) {
				dy = nextItem.value - item.value;
				y += step * ((pct - item.value) / dy);
				break;
			}
			y += step;
		}
		
		return rect.top + rect.height - y;
	};
	
	LongGraph.prototype.drawRecord = function(rec, idx, x, all) 
	{
		x = this.getRecordX(rec, idx, true);
		this.drawDot(x, this.pct2Y(rec.dPercentile, "diastolic" ), rec.dPercentile, rec.dAbbreviation);
		this.drawDot(x, this.pct2Y(rec.sPercentile, "sysstolic"), rec.sPercentile, rec.dAbbreviation);
	};
	
	LongGraph.prototype.drawDot = function(x, y, percentile, abbreviation) {
		var title = [];
		
		
		
		var dot = this.paper.circle(x, y, 0).attr(
			percentile > 95 ? this.settings.dotAttrHypertensive : 
			percentile > 90 ? this.settings.dotAttrPrehypertensive : 
			this.settings.dotAttr
		);
		
		if (abbreviation) {
			title.push(abbreviation);
		}
		
		if (percentile) {
			title.push(percentile + "%");
		}
		
		if (title.length) {
			dot.attr("title", title.join("\n"));
		}
	};
	
	LongGraph.prototype.draw = function() {
		this.paper.rect( 0, 0, this.paper.width, this.paper.height ).attr({
			fill : "none",
			"stroke-dasharray": "- ",
			"stroke" : BPC.Constants.COLOR_GREY_5
		});
		this.drawZones();
		BPC.Graph.prototype.draw.apply(this, arguments);
		//console.log(this.getTickInterval(), this.getTickInterval(true));
	};
	
	LongGraph.prototype.drawZones = function() 
	{
		var x = this.plotRect.left, 
			w = this.plotRect.width, 
			y1, y2, z;
		for ( var i = 0, l = this.zones.length; i < l; i++ ) {
			z = this.zones[i];
			
			y1 = this.pct2Y(z.endPct  , "systolic");
			y2 = this.pct2Y(z.startPct, "systolic");
			this.paper.rect(x, y1, w, y2 - y1).attr({
				"fill" : z.bgColor,
				"stroke" : "none"
			}).toBack();
			
			y1 = this.pct2Y(z.endPct  , "diastolic");
			y2 = this.pct2Y(z.startPct, "diastolic");
			this.paper.rect(x, y1, w, y2 - y1).attr({
				"fill" : z.bgColor,
				"stroke" : "none"
			}).toBack();
		}
	};
	
	LongGraph.prototype.drawGrid = function() {
		var s = this.settings;
		var patient = this.model;
		var inst = this;
		
        
        function drawGrid(x1, y1, x2, y2) {
			var h    = y2 - y1,
				l    = inst.dimesionY.length,
				step = h / (l - 1),
				item, y, i;
			
			for (i = 0; i < l; i++) {
				item = inst.dimesionY[i];
				y = y2 - step * i;
				inst.paper.path("M" + [ x1, y ] + "H" + x2).attr({
					stroke : s.gridColor
				}).crisp();
				
				if (item.label) {
					inst.paper.text(x1 - BPC.Constants.FONT_SIZE * 1.6, y, item.label).attr(inst.settings.VAxisLabelsAttr);
					inst.paper.text(x2 + BPC.Constants.FONT_SIZE * 1.6, y, item.label).attr(inst.settings.VAxisLabelsAttr);
				}
			}
		}
        
        drawGrid(
			this.systolicPlotRect.left,
			this.systolicPlotRect.top,
			this.systolicPlotRect.left + this.systolicPlotRect.width,
			this.systolicPlotRect.top + this.systolicPlotRect.height
        );
        
        drawGrid(
			this.diastolicPlotRect.left,
			this.diastolicPlotRect.top,
			this.diastolicPlotRect.left + this.diastolicPlotRect.width,
			this.diastolicPlotRect.top + this.diastolicPlotRect.height
        );
        
        var axis = this.getTimeRange();
        console.log("axis: ", axis);
        
        for ( var i = 0, x; i < axis.tickCount; i++ ) {
			x = axis.ticks[i].endX;
			
			// Skip the last vertical lines
			if (i < axis.tickCount - 1) {
				inst.paper.path(
					"M" + [ x, this.systolicPlotRect.top ] + 
					"v" + this.systolicPlotRect.height
				).attr({
					stroke : BPC.Constants.COLOR_GREY_4,
					"stroke-dasharray" : "- "
				}).crisp();
				
				inst.paper.path(
					"M" + [ x, this.diastolicPlotRect.top ] + 
					"v" + this.diastolicPlotRect.height
				).attr({
					stroke : BPC.Constants.COLOR_GREY_4,
					"stroke-dasharray" : "- "
				}).crisp();
			}
			
			this.paper.text(
				x - axis.tickWidth / 2,
				this.height - 40,
				new XDate(axis.ticks[i].startTime).getFullYear()
			).attr(inst.settings.VAxisLabelsAttr);
		}
		return;
        var tick = this.getTickInterval(true), 
			x    = this.plotRect.left,
			d    = new XDate();
        while ( x < this.plotRect.right - tick.px ) {
			x += tick.px;
			d.addMilliseconds(tick.time);
			
			inst.paper.path(
				"M" + [ x, this.systolicPlotRect.top ] + 
				"v" + this.systolicPlotRect.height
			).attr({
				stroke : BPC.Constants.COLOR_GREY_4,
				"stroke-dasharray" : "- "
			}).crisp();
			
			inst.paper.path(
				"M" + [ x, this.diastolicPlotRect.top ] + 
				"v" + this.diastolicPlotRect.height
			).attr({
				stroke : BPC.Constants.COLOR_GREY_4,
				"stroke-dasharray" : "- "
			}).crisp();
			
			this.paper.text(
				x - tick.px / 2,
				this.height - 40,
				d.getFullYear()
			);
		}
		
		
		
		return;
        var len = this.model.data.length,
			w   = this.plotRect.width,
			d1  = new XDate(this.model.data[0].unixTime),
			d2  = new XDate(this.model.data[len - 1].unixTime),
			dY  = Math.ceil(d1.diffYears(d2)),
			i, x;
		
		//console.log(d1, d2, d1.diffYears(d2));
		
		for ( i = 1; i < dY; i++ ) {
			x = this.plotRect.left + (this.plotRect.width / dY) * i;
			
			
		}
		
		this.paper.text(
			x + (this.plotRect.width / dY) * 0.5,
			this.settings.height - 40,
			d1.getFullYear() + dY - 1
		);
        
	};
	
	LongGraph.prototype.drawYAxis = function() 
	{	
		this.paper.path(
			"M" + [this.systolicPlotRect.left, this.systolicPlotRect.top] + " " + 
			"v" + this.systolicPlotRect.height + 
			"M" + [this.diastolicPlotRect.left, this.diastolicPlotRect.top] + " " + 
			"v" + this.diastolicPlotRect.height
		).attr({
			stroke : BPC.Constants.COLOR_GREY_4
		}).crisp();
	};
	
	LongGraph.prototype.drawXAxis = function() 
	{	
		this.paper.path(
			"M" + [this.systolicPlotRect.left, this.systolicPlotRect.top + this.systolicPlotRect.height] + " " + 
			"h" + this.systolicPlotRect.width + 
			"M" + [this.diastolicPlotRect.left, this.diastolicPlotRect.top + this.diastolicPlotRect.height] + " " + 
			"h" + this.diastolicPlotRect.width
		).attr({
			stroke : BPC.Constants.COLOR_GREY_4
		}).crisp();
		
		this.paper.text(
			BPC.Constants.FONT_SIZE / 1.5, 
			this.systolicPlotRect.top + this.systolicPlotRect.height / 2, 
			"S\nY\nS\nT\nO\nL\nI\nC"
		).attr(this.settings.VAxisTitlesAttr);
		
		this.paper.text(
			this.width - BPC.Constants.FONT_SIZE / 1.5, 
			this.systolicPlotRect.top + this.systolicPlotRect.height / 2, 
			"S\nY\nS\nT\nO\nL\nI\nC"
		).attr(this.settings.VAxisTitlesAttr);
		
		this.paper.text(
			BPC.Constants.FONT_SIZE / 1.5, 
			this.diastolicPlotRect.top + this.diastolicPlotRect.height / 2, 
			"D\nI\nA\nS\nT\nO\nL\nI\nC"
		).attr(this.settings.VAxisTitlesAttr);
		
		this.paper.text(
			this.width - BPC.Constants.FONT_SIZE / 1.5,
			this.diastolicPlotRect.top + this.diastolicPlotRect.height / 2, 
			"D\nI\nA\nS\nT\nO\nL\nI\nC"
		).attr(this.settings.VAxisTitlesAttr);
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
		drawLongGraph( "#long-graph", patient );
		drawTable( "#table-view", patient, false );
	}
	
	/**
	 * Draws the "short-view" graph.
	 * @param {String CSS selector | DOMElement | jQuery } container 
	 * @param {Patient} patient
	 */
	function drawShortGraph( container, patient ) {
		(new ShortGraph(container, patient.recentEncounters(3))).draw();
	}
	
	/**
	 * Draws the "long-view" graph.
	 * @param {String CSS selector | DOMElement | jQuery } container 
	 * @param {Patient} patient
	 */
	function drawLongGraph( container, patient ) {
		(new LongGraph(container, patient)).draw();
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
	function drawTable( container, patient, short ) {
		
		// Apply filters 
		var p = patient.applyFilters ();
		
		// Reverse the data order
		p.data.reverse();
		
		// Generate the table output
		$(container).setTemplateElement("template").processTemplate(
			p, 
			{ short : !!short ? 1 : 0 }
		);
	}
	
	
	
});