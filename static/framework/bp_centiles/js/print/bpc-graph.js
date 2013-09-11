(function(NS, $) {
	
	function isNumber(x) 
	{
		var _x = parseFloat(x);
		return !isNaN(_x) && isFinite(_x);
	}
	
	/**
	 * Class Point - just a basic functionality here (x, y and a data object to
	 * store aditional custom information)
	 * @constructor
	 * @param {Number} x
	 * @param {Number} y
	 * @param {Object} data Optional data
	 */
	function Point( x, y, data ) 
	{
		this.x = x;
		this.y = y;
		this.data = data || {};
	}
	
	/**
	 * Class Rect. Represents a canonical rectangle constructed by two points.
	 * @param {Point} p1
	 * @param {Point} p1
	 */
	function Rect( p1, p2 ) 
	{
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
				this.width = this.container.width();
				this.height = this.container.height();
				this.model = model;
				this.settings = this.getSettings(settings);
				
				this.paper = Raphael(this.container[0], this.width, this.height);
				
				this.plotRect = new Rect(
					new Point(
						this.settings.leftgutter, 
						this.settings.topgutter
					),
					new Point(
						this.width - this.settings.rightgutter,
						this.height - this.settings.bottomgutter
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
				this.settings = $.extend(
					true, 
					{}, 
					customSettings
				);
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
			
			var stepX = innerWidth / Math.max( len, 1 );
            return Math.round( startX + stepX * (recordIndex + 0.5) );
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
				stepY   = (this.plotRect.height - s.bottomgutter - s.topgutter) / s.max,  // The Y distance per percentile
				innerWidth = this.plotRect.width - s.leftpadding - s.rightpadding;
			
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
				yD    = Math.round(this.height - this.settings.bottomgutter - stepY * rec.diastolic),
				yS    = Math.round(this.height - this.settings.bottomgutter - stepY * rec.systolic );
			
			this.drawDot(x, yD, rec.dPercentile, rec.dAbbreviation);
			this.drawDot(x, yS, rec.sPercentile, rec.sAbbreviation);
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
	NS.Point         = Point;
	NS.Rect          = Rect;
	NS.Graph         = Graph;
	
})(window.BPC || {}, jQuery);
