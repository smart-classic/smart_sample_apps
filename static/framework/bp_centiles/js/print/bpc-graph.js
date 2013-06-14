(function(NS, $) {
	
	// Basic configuration for all graphs. The subclasses of Graph will inherit 
	// and extend this configuration
	var CONFIG = {
		
		// dimensions for the drawing area (in pixels)
		width : 760,
		height: 420,
		
		// margins to be left around the main grid (for labels etc)
		leftgutter   : 40, 
		rightgutter  : 40,
		bottomgutter : 30,
		topgutter    : 30,
		leftpadding  : 0, 
		rightpadding : 0,
		
		// parameters for the graph's background grid
		gridRows : 20,  
		gridCols : 20,
		gridColor: "#CECECE",
		
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
	};
	
	var MILLISECOND = 1;
		SECOND      = 1000;
		MINUTE      = 1000 * 60;
		HOUR        = 1000 * 60 * 60;
		DAY         = 1000 * 60 * 60 * 24;
		WEEK        = 1000 * 60 * 60 * 24 * 7;
		MONTH       = 1000 * 60 * 60 * 24 * 7 * 4.348214285714286;
		YEAR        = 1000 * 60 * 60 * 24 * 7 * 4.348214285714286 * 12;
	
	function Point( x, y, data ) {
		this.x = x;
		this.y = y;
		this.data = data || {};
	}
	
	function Rect( p1, p2 ) {
		this.left   = Math.min( p1.x, p2.x );
		this.right  = Math.max( p1.x, p2.x );
		this.top    = Math.min( p1.y, p2.y );
		this.bottom = Math.max( p1.y, p2.y );
		this.width  = this.right - this.left;
		this.height = this.bottom - this.top;
	}
	
	/**
	 * Graph - The base class for graphs.
	 * @constructor
	 * @abstract
	 */
	function Graph() {}
	
	Graph.prototype = {
		
		/**
		 * The Raphael paper for this graph.
		 */
		paper : null,
		
		/**
		 * Initializes the graph (stores a ref. to the container as property, 
		 * creates a paper etc.). The initialization is moved here, so that the
		 * subclasses can inherit from this class without extra overhead from 
		 * it's constructor.
		 * 
		 * @param {String CSS selector | DOMElement | jQuery } container 
		 * @param {BPC.Patient} model
		 * @param {Object} settings Any additional settings might be passed here
		 *                          to extend the default configuration.
		 */
		init : function( container, model, settings ) 
		{
			if (!this._initialized) {
				this._initialized = true;
				this.container = $(container);
				this.model = model;
				this.settings = this.getSettings(settings);
				
				this.paper = Raphael(
					this.container[0], 
					this.settings.width, 
					this.settings.height
				);
				
				this.plotRect = new Rect(
					new Point(
						this.settings.leftgutter, 
						this.settings.topgutter
					),
					new Point(
						this.settings.width - this.settings.rightgutter,
						this.settings.height - this.settings.bottomgutter
					)
				);
			}
			return this;
		},
		
		/**
		 * Each subclass can extend this method to change it's settings. The 
		 * output must be an object that is going to be merged with the base 
		 * settings from PrintSettings.GraphsCommonSettings.
		 * 
		 * @param {Object} customSettings Any additional settings might be 
		 *                                passed here to extend the default 
		 *                                configuration.
		 * @returns Object
		 */
		getSettings : function( customSettings ) 
		{
			if (!this.settings) {
				this.settings = $.extend( true, {}, CONFIG, customSettings );
			}
			return this.settings;
		},
		
		/**
		 * Clears the paper for this graph. Subclasses might extend this to also
		 * free some additional resources at this point.
		 */
		clear : function() 
		{
			this.paper.clear();
		},
		
		/**
		 * Iterates over each record in the model and calls the callback 
		 * function. No matter what the exact visual representation of each 
		 * record is, one common thing is that the records are spread over the 
		 * available X space, so this method also calculates the X position for 
		 * each record and passes it as param to the callback. The callback is 
		 * called with the following arguments:
		 * 1. The record object
		 * 2. The record index
		 * 3. The X coordinate computed for that record index
		 * 4. All the records
		 * The callback might return false (strictly) to break the loop.
		 * 
		 * @param {Function} callback
		 */
		forEachRecord : function( callback ) 
		{
			var len = this.model.data.length;
			
			if (len < 1) {
				return;
			} 
			
			var innerWidth = this.plotRect.width - 
							 this.settings.leftpadding - 
							 this.settings.rightpadding,
				startX = this.settings.leftgutter + this.settings.leftpadding,
				dx,
				rec,
				x, 
				i;
				
			for ( i = 0; i < len; i++ ) {
				rec = this.model.data[i];
				
				// Calculate the x coordinate for this data point
                dx = innerWidth / Math.max( len, 1 );
                x = Math.round( startX + dx * (i + 0.5) );
                
                if ( callback.call(this, rec, i, x, this.model.data) === false ) {
					break;
				}
			}
		},
		
		getTimeRange : function() 
		{
			var len = this.model.data.length;
			
			var axis = {
				startX     : this.plotRect.left,
				startY     : this.plotRect.bottom,
				endX       : this.plotRect.right,
				endY       : this.plotRect.bottom,
				width      : this.plotRect.width,
				innerWidth : this.plotRect.width - 
					(this.settings.leftpadding || 0) - 
					(this.settings.rightpadding || 0),
				
				dataDuration : 0,
				tickDuration : 0,
				tickWidth : 0,
				tickCount : 0,
				ticks : []
			};
			
			var d1 = new XDate(this.model.data[0      ].unixTime),
				d2 = new XDate(this.model.data[len - 1].unixTime);
			
			axis.dataDuration = d1.diffMilliseconds(d2);
			
			if (axis.dataDuration > YEAR) {
				
				axis.tickDuration = YEAR;
				d1.setMonth(0, true);
				d2.setMonth(11, true);
				axis.dataDuration = d1.diffMilliseconds(d2);
				
			} else if (diff > MONTH) {
				out.time = MONTH;
			} else if (diff > WEEK) {
				out.time = WEEK;
			} else if (diff > DAY) {
				out.time = DAY;
			} else if (diff > HOUR) {
				out.time = HOUR;
			} else if (diff > MINUTE) {
				out.time = MINUTE;
			} else if (diff > SECOND) {
				out.time = SECOND;
			} else {
				out.time = MILLISECOND;
			}
			
			axis.tickCount = Math.ceil( axis.dataDuration / axis.tickDuration );
			axis.tickWidth = axis.innerWidth / axis.tickCount;
			
			var i, 
				x = axis.startX, 
				t = d1.getTime(), 
				tick;
			for ( i = 0; i < axis.tickCount; i++ ) {
				tick = {
					startX : x,
					startTime : t
				};
				
				x += axis.tickWidth;
				t += axis.tickDuration;
				
				tick.endTime = t;
				tick.endX = x;
				
				axis.ticks.push(tick);
			}
			
			return axis;
		},
		
		getTickInterval : function( useTime ) 
		{
			var len = this.model.data.length,
				out = { px : this.plotRect.width },
				innerWidth = this.plotRect.width - 
					(this.settings.leftpadding || 0) - 
					(this.settings.rightpadding || 0);
			
			if ( len ) {
				if ( !useTime ) {
					out.px = innerWidth / len;
				} else {
					var d1 = new XDate(this.model.data[0      ].unixTime),
						d2 = new XDate(this.model.data[len - 1].unixTime);
					
					var diff = d1.diffMilliseconds(d2);
					
					if (diff > YEAR) {
						out.time = YEAR;
					} else if (diff > MONTH) {
						out.time = MONTH;
					} else if (diff > WEEK) {
						out.time = WEEK;
					} else if (diff > DAY) {
						out.time = DAY;
					} else if (diff > HOUR) {
						out.time = HOUR;
					} else if (diff > MINUTE) {
						out.time = MINUTE;
					} else if (diff > SECOND) {
						out.time = SECOND;
					} else {
						out.time = MILLISECOND;
					}
					
					out.px = innerWidth / (diff / out.time);
				}
			}
			
			return out;
		},
		
		/**
		 * There are two possible ways to compute the X coordinate for the 
		 * record, depending on how the chart should behave.
		 * 1. If the chart should spread it's record equally over the X space
		 * 2. If X is actually a time axis 
		 */ 
		getRecordX : function(record, recordIndex, useTime) {
			
			var len = this.model.data.length;
			
			if (len < 1) {
				return -1;
			} 
			
			var innerWidth = this.plotRect.width - 
							 (this.settings.leftpadding || 0) - 
							 (this.settings.rightpadding || 0);
			
			var startX = this.plotRect.left + (this.settings.leftpadding || 0);
			
			if ( !useTime ) {
				var stepX = innerWidth / Math.max( len, 1 );
                return Math.round( startX + stepX * (recordIndex + 0.5) );
			}
			
			// Time
			var d1   = new XDate(this.model.data[0      ].unixTime).setMonth(0, true),
				d2   = new XDate(this.model.data[len - 1].unixTime).setMonth(11, true),
				dT   = d1.diffMilliseconds(d2),
				pxMs = innerWidth / dT;
				
			return startX + pxMs * (record.unixTime - d1.getTime());
		},
		
		getRecordY : function() {},
		
		/**
		 * The main drawing method. Computes some common stuff and calls other 
		 * drawing methods to render specific things on the graph.
		 */
		draw : function() 
		{
			if (!this.model.data || !this.model.data.length) {
				this.drawNoData();
				return;
			}
			
			var s       = this.settings,
				inst    = this,
				patient = this.model,
				stepY   = (s.height - s.bottomgutter - s.topgutter) / s.max,  // The Y distance per percentile
				innerWidth = s.width - s.leftgutter - s.rightgutter - s.leftpadding - s.rightpadding;
			
			this.drawGrid(patient);
			this.drawXAxis();
			this.drawYAxis();
			
			this.forEachRecord(this.drawRecord);
		},
		
		/**
		 * Can be used to draw "no data" message.
		 */
		drawNoData : function()
		{
			this.paper.rect( 1, 1, this.paper.width - 2, this.paper.height - 2 )
			.attr({
				"fill"   : "#FFF",
				"stroke" : "#999"
			}).crisp();
			
			this.paper.text( 
				this.paper.width / 2, 
				this.paper.height / 2 - 7,
				"No data available"
			).attr({
				"font-size" : 14,
				"fill" : "#666"
			});
		},
		
		/**
		 * Render single record from the patient's data. Basically this means to
		 * draw two data circles for the systolic and diastolic values.
		 */
		drawRecord : function(rec, idx, x, all) 
		{
			var stepY = this.plotRect.height / this.settings.max,
				yD    = Math.round(this.settings.height - this.settings.bottomgutter - stepY * rec.diastolic),
				yS    = Math.round(this.settings.height - this.settings.bottomgutter - stepY * rec.systolic );
			
			this.drawDot(x, yD, rec.dPercentile, rec.dAbbreviation);
			this.drawDot(x, yS, rec.sPercentile, rec.dAbbreviation);
		},
		
		/**
		 * Draws one data circle 
		 */
		drawDot : function (x, y, percentile, abbreviation) 
		{
			var title = [];
			
			var dot = this.paper.circle(x, y, 0).attr(this.settings.dotAttr);
			
			if (abbreviation) {
				title.push(abbreviation);
			}
			
			if (percentile) {
				title.push(percentile + "%");
			}
			
			if (title.length) {
				dot.attr("title", title.join("\n"));
			}
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
	
	// Export classes to the namespace
	NS.Point = Point;
	NS.Rect  = Rect;
	NS.Graph = Graph;
	
})(window.BPC || {}, jQuery);
