(function(NS, $) {	
	
	/**
	 * Class ShortGraph extends NS.Graph
	 * @constructor
	 * @param {String CSS selector | DOMElement | jQuery } container 
	 * @param {NS.Patient} model The patient to visualize
	 */
	function ShortGraph(container, model) 
	{
		this.init(container, model);
	}
	
	ShortGraph.prototype = new NS.Graph();
	
	/**
	 * Returns the ShortView specific settings merged with the base settings.
	 */
	ShortGraph.prototype.getSettings = function() 
	{
		return NS.Graph.prototype.getSettings.call(
			this, 
			BPC.printSettings.shortGraph
		); 
	};
	
	/**
	 * Draws the horizontal grid lines
	 */
	ShortGraph.prototype.drawGrid = function() 
	{
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
			-1 // transitionX
		);
	};
	
	/**
	 * Draws the X axis line and labels
	 */ 
	ShortGraph.prototype.drawXAxis = function() 
	{
		// The bottom line
		this.paper.path(
			"M" + [
				this.settings.leftgutter, 
				this.height - this.settings.bottomgutter
			] +
			"h" + ( this.width - 
					this.settings.leftgutter - 
					this.settings.rightgutter )
		).attr({
			stroke : NS.Constants.COLOR_GREY_3
		}).crisp();
		
		// the date labels
		this.forEachRecord(function(rec, idx, x, all) {
			this.paper.text(
				x, 
				this.plotRect.bottom + 15, 
				rec.date
			).attr(this.settings.HAxisLabelsAttr);
		});
	};
	
	/**
	 * Draws the Y axis line and labels
	 */
	ShortGraph.prototype.drawYAxis = function() 
	{
		this.paper.path(
			"M" + [this.settings.leftgutter, 0] + " " + 
			"v" + (this.height - this.settings.bottomgutter)
		).attr({
			stroke : NS.Constants.COLOR_GREY_3
		}).crisp();
		
		// Draw the percentiles axis
		this.paper.drawVAxisLabels(
			this.settings.leftgutter - 15, 
			this.settings.topgutter,
			this.plotRect.height, 
			this.settings.vLabels, 
			this.settings.max, 
			"", // vAxisLabel, 
			this.settings.VAxisLabelsAttr, 
			true // shortTerm
		);
	};
	
	/**
	 * Draws one data circle. 
	 * Overrides the base method to also draw the label inside the circle.
	 * @param {Number} x
	 * @param {Number} y
	 * @param {Number} percentile
	 * @param {Number} abbreviation
	 */
	ShortGraph.prototype.drawDot = function (x, y, percentile, abbreviation) 
	{
		var labelText = this.settings.abbreviationDefault;
		if (abbreviation) {
			labelText = abbreviation;
		} else if (percentile) {
			labelText = percentile + "%";
		}
		
		this.paper.circle(x, y, 0).attr(
			percentile > 95 ? this.settings.dotAttrHypertensive : 
			percentile > 90 ? this.settings.dotAttrPrehypertensive : 
			this.settings.dotAttr
		);
		
		this.paper.text(x, y, labelText).attr(
			this.settings.dotLabelAttr
		).toFront();
	};
	
	/**
	 * Render single record from the patient's data. 
	 * Overrides the base method to also draw a connecting line between the two 
	 * circles.
	 */
	ShortGraph.prototype.drawRecord = function(rec, idx, x, all) 
	{
		// Draw the vertical line connecting the pair of dots
		var s      = this.settings,
			stepY  = this.plotRect.height / s.max,
			bottom = this.height - s.bottomgutter,
			y1     = Math.round(bottom - stepY * rec.diastolic),
			y2     = Math.round(bottom - stepY * rec.systolic ),
			strokeWidth = this.settings.dotAttr["stroke-width"];
		
		this.paper.path ("M" + x + " " + y1 + "L" + x + " " + y2).attr({
			stroke           : this.settings.dotAttr.stroke, 
			"stroke-width"   : Math.max(Math.floor(strokeWidth), 1), 
			"stroke-linejoin": "round"
		}).crisp();
		
		NS.Graph.prototype.drawRecord.call(this, rec, idx, x, all);
	};
	
	// Export this class to the namespace
	NS.ShortGraph = ShortGraph;
	
})(BPC, jQuery);
