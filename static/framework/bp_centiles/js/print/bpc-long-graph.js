(function(NS, $, undefined) {
	
	/**
	 * LongGraph extends NS.Graph
	 * @constructor
	 * @param {String CSS selector | DOMElement | jQuery } container 
	 * @param {NS.Patient} model The patient to visualize
	 */
	function LongGraph(container, model) {
		
		// First call the init() from the base class to initialize it
		this.init(container, model);
		
		/**
		 * The rectangle of the systolic plot
		 */ 
		this.systolicPlotRect = new NS.Rect(
			new NS.Point(
				this.plotRect.left, 
				this.plotRect.top
			),
			new NS.Point(
				this.plotRect.right,
				this.plotRect.top  + this.plotRect.height / 2 - 
					this.settings.plotsMargin / 2
			)
		);
		
		/**
		 * The rectangle of the diastolic plot
		 */ 
		this.diastolicPlotRect = new NS.Rect(
			new NS.Point(
				this.plotRect.left, 
				this.plotRect.top + this.plotRect.height / 2 + 
					this.settings.plotsMargin / 2
			),
			new NS.Point(
				this.plotRect.right,
				this.plotRect.bottom
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
		
		this.TimeIterator = new NS.TimeIterator(
			this.model.data[0].unixTime,
			this.model.data[this.model.data.length - 1].unixTime,
			true
		);
	}
	
	/**
	 * Inherit from NS.Graph
	 */
	LongGraph.prototype = new NS.Graph();
	
	/**
	 * Returns the LongView specific settings.
	 */
	LongGraph.prototype.getSettings = function() 
	{
		return NS.Graph.prototype.getSettings.call(
			this, 
			BPC.printSettings.longGraph
		);
	};
	
	/**
	 * The Y dimension of this graph is not linear, so we need a method to 
	 * convert percentiles to Y positions.
	 * @param {Number} pct The percentile to convert
	 * @param {String} type Can be "systolic" or "diastolic"
	 * @returns {Number} The Y coordinate relative to the paper 
	 */
	LongGraph.prototype.pct2Y = function(pct, type) 
	{
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
	
	/**
	 * For this chart drawing a record means to draw two dots - one on the 
	 * systolic and one on the diastolic plot.
	 * @param {Object} rec The record 
	 * @param {Number} idx The record's index in the entire records collection
	 */
	LongGraph.prototype.drawRecord = function(rec, idx) 
	{
		var x            = this.getRecordX(rec, idx, true);
		var systolicPct  = this.pct2Y(rec.sPercentile, "sysstolic"); 
		var diastolicPct = this.pct2Y(rec.dPercentile, "diastolic"); 
		this.drawDot( x, diastolicPct, rec.dPercentile, rec.dAbbreviation );
		this.drawDot( x, systolicPct , rec.sPercentile, rec.dAbbreviation );
	};
	
	/**
	 * Draws a "dot" on the plot. The dots have different title, stroke width 
	 * and stroke color, depending on their value. 
	 * @param {Number} x The X coordinate of the dot
	 * @param {Number} y The Y coordinate of the dot
	 * @param {Number} percentile The percentile value of the dot
	 * @param {String} abbreviation Optional short description
	 */
	LongGraph.prototype.drawDot = function(x, y, percentile, abbreviation) 
	{
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
	
	/**
	 * The drawing starts here. Darws the zones and then calls the parent's 
	 * draw method to do the rest. That will call another drwing methods, some 
	 * of which are also redefined here. 
	 */ 
	LongGraph.prototype.draw = function() 
	{
		this.drawZones();
		NS.Graph.prototype.draw.apply(this, arguments);
	};
	
	/**
	 * Highlights the zones on the systolic and diastolic plots using a 
	 * configurable shade of grey.
	 */
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
				"fill"   : z.bgColor,
				"stroke" : "none"
			}).toBack().crisp();
			
			if (z.startPct > 50) {
				this.paper.path(
					"M" + [x, y2] + "h" + w
				).attr({
					"stroke"         : "black",
					"stroke-opacity" : 0.3
				}).crisp();
			}
			
			y1 = this.pct2Y(z.endPct  , "diastolic");
			y2 = this.pct2Y(z.startPct, "diastolic");
			this.paper.rect(x, y1, w, y2 - y1).attr({
				"fill"   : z.bgColor,
				"stroke" : "none"
			}).toBack().crisp();
			
			if (z.startPct > 50) {
				this.paper.path(
					"M" + [x, y2] + "h" + w
				).attr({
					"stroke"         : "black",
					"stroke-opacity" : 0.3
				}).crisp();
			}
		}
	};
	
	/**
	 * Draws the grid. That includes the horizontal lines, the vertical dashed 
	 * lines, the percentile labels on both sides and the "today" marker 
	 * if in range.
	 */
	LongGraph.prototype.drawGrid = function() 
	{
		var s       = this.settings,
			patient = this.model,
			inst    = this,
			step    = this.TimeIterator.getTimeStep(),
			now     = (new Date()).getTime(),
			right   = Math.max(Math.min(
				this.plotRect.right,
				this.getAdultTreshold()
			), this.plotRect.left),
			i       = 0,
			current, pos, w, q, x;
			
		
		function drawGrid(x1, y1, x2, y2) {
			var h    = y2 - y1,
				l    = inst.dimesionY.length,
				step = h / (l - 1),
				item, y, i;
			
			for (i = 0; i < l - 1; i++) {
				item = inst.dimesionY[i];
				y = y2 - step * i;
				inst.paper.path("M" + [ x1, y ] + "H" + x2).attr({
					stroke : "black",
					"stroke-opacity" : 0.2
				}).crisp();
				
				if (item.label) {
					
					// left percentile label
					inst.paper.text(
						x1 - NS.Constants.FONT_SIZE * 1.6, 
						y, 
						item.label
					).attr(inst.settings.VAxisLabelsAttr);
					
					// right percentile label
					inst.paper.text(
						inst.plotRect.right + NS.Constants.FONT_SIZE * 2, 
						y, 
						item.label
					).attr(inst.settings.VAxisLabelsAttr);
				}
			}
			
			if (x2 > inst.plotRect.left && x2 < inst.plotRect.right) {
				
				// The vertical edge line
				inst.paper.path("M" + [ x2, y1 ] + "V" + y2).attr({
					stroke         : NS.Constants.COLOR_GREY_3,
					"stroke-width" : 1,
					"stroke-opacity" : 0.7
				}).crisp();
				
				// First draw the "Adult" label and get it's BBox
				var label = inst.paper.text(
					x2 + (inst.plotRect.right - x2) / 2,
					y2 - 16,
					"Adult"
				).attr({
					"font-family" : "Verdana, sans-serif",
					"font-weight" : "bold",
					"fill" : NS.Constants.COLOR_GREY_3
				});
				
				var labelBox = label.getBBox();
				//console.log(labelBox);
				var space = inst.plotRect.right - x2,
					labelPaddingX     = 6,
					labelPaddingY     = 2,
					minSpaceForText   = labelBox.width + labelPaddingX * 2,
					minSpaceForArrows = minSpaceForText + 20,
					minSpaceForLines  = minSpaceForArrows + 20;
				
				if (space < minSpaceForText) {
					label.hide();
				} else {
					if (space >= minSpaceForLines) {
						// Connecting lines
						inst.paper.path(
							"M" + [ x2 + 10, y2 - 16 ] + 
							"H" + (labelBox.x - labelPaddingX) + 
							"M" + [labelBox.x + labelBox.width + labelPaddingX, y2 - 16 ] +
							"H" + (inst.plotRect.right - 10)
						).attr({
							stroke         : NS.Constants.COLOR_GREY_4,
							"stroke-width" : 1,
							"stroke-opacity" : 0.7
						}).crisp();
						
						inst.paper.rect().attr({
							x: labelBox.x - labelPaddingX,
							y: labelBox.y - labelPaddingY,
							width  : labelBox.width + labelPaddingX * 2,
							height : labelBox.height + labelPaddingY * 2,
							stroke : "none"//NS.Constants.COLOR_GREY_3,
							//fill   : "#FFF"
						}).crisp();
					}
					
					if (space >= minSpaceForArrows) {
						// Left arrow
						inst.paper.path(
							"M" + [ x2, y2 - 16 ] + 
							"l 10,-5 v 10 Z"
						).attr({
							fill : NS.Constants.COLOR_GREY_7,
							stroke: NS.Constants.COLOR_GREY_4
						});
						
						// Right arrow
						inst.paper.path(
							"M" + [ inst.plotRect.right, y2 - 16 ] + 
							"l -10,-5 v 10 Z"
						).attr({
							fill : NS.Constants.COLOR_GREY_7,
							stroke: NS.Constants.COLOR_GREY_4
						});
					}
				}
			}
		}
		
		function drawLine(x) {
			inst.paper.path(
				"M" + [x, inst.plotRect.top] + 
				"v" + inst.systolicPlotRect.height + 
				"M" + [x, inst.diastolicPlotRect.top] + 
				"v" + inst.diastolicPlotRect.height
			).attr({
				stroke : NS.Constants.COLOR_GREY_4,
				"stroke-dasharray" : "- "
			}).crisp();
		}
		
		// Horizontal lines on the systolic plot
		drawGrid(
			this.systolicPlotRect.left,
			this.systolicPlotRect.top,
			right,
			this.systolicPlotRect.top + this.systolicPlotRect.height
		);
		
		// Horizontal lines on the diastolic plot
		drawGrid(
			this.diastolicPlotRect.left,
			this.diastolicPlotRect.top,
			right,
			this.diastolicPlotRect.top + this.diastolicPlotRect.height
		);
		
		// Vertical dashed lines for days, weeks, years or months
		if (step != "Millisecond" && step != "Second" && step != "Minute") {
			this.TimeIterator.rewind();
			while ( this.TimeIterator.hasNext() ) {
				if (i++) { // Skip the first vertical line
					current = this.TimeIterator.current();
					if (!pos || current.pos - pos > 1/150) { // max 150 lines
						drawLine(
							this.plotRect.left + 
							this.plotRect.width * current.pos
						);
						pos = current.pos;
					}
				}
				this.TimeIterator.next();
			}
		}
		
		// The "today" marker if in range
		if (now >= this.TimeIterator.startTime && 
			now <= this.TimeIterator.endTime) 
		{
			w = this.TimeIterator.endTime - this.TimeIterator.startTime;
			q = (now - this.TimeIterator.startTime) / w;
			x = inst.plotRect.left + inst.plotRect.width * q;
			
			inst.paper.path(
				"M" + [x, inst.plotRect.top - 3] + 
				"V" + inst.plotRect.bottom
			).attr({
				stroke : "#000",
				opacity: 0.3
			}).crisp();
			
			inst.paper.text(x, inst.plotRect.top - 10, "Today").attr(
				this.settings.XAxisLabelsAttr
			);
		}
	};
	
	/**
	 * Finds the X coordinate of the given record using its unixTime property.
	 * @param {Object} record The record
	 */
	LongGraph.prototype.getRecordX = function(record) 
	{
		var len = this.model.data.length;
		
		if (len < 1) {
			return -1;
		} 
		
		var innerWidth = this.plotRect.width - 
						 (this.settings.leftpadding || 0) - 
						 (this.settings.rightpadding || 0),
			startX    = this.plotRect.left + (this.settings.leftpadding || 0);
			startTime = this.TimeIterator.startTime,
			endTime   = this.TimeIterator.endTime,
			diff      = endTime - startTime,
			pxMs      = innerWidth / diff;
			
		return startX + pxMs * (record.unixTime - startTime);
	};
	
	LongGraph.prototype.getAdultTreshold = function()
	{
		var 
		
		innerWidth = this.plotRect.width - 
					 (this.settings.leftpadding || 0) - 
					 (this.settings.rightpadding || 0),
		startX    = this.plotRect.left + (this.settings.leftpadding || 0);
		startTime = this.TimeIterator.startTime,
		endTime   = this.TimeIterator.endTime,
		diff      = endTime - startTime,
		pxMs      = innerWidth / diff,
		pos       = new XDate(this.model.birthdate)
			.addYears(BPC.settings.adult_age)
			.getTime();
			
		return startX + pxMs * (pos - startTime);
	};
	
	/**
	 * Draws the vertical lines on the left edge of the plots and their 
	 * "systolic" or "diastolic" titles.
	 */
	LongGraph.prototype.drawYAxis = function() 
	{	
		this.paper.path(
			"M" + [this.systolicPlotRect.left, this.systolicPlotRect.top] + 
			"v" + this.systolicPlotRect.height + 
			"M" + [this.diastolicPlotRect.left, this.diastolicPlotRect.top] + 
			"v" + this.diastolicPlotRect.height
		).attr({
			stroke : NS.Constants.COLOR_GREY_4
		}).crisp();
		
		this.paper.text(
			NS.Constants.FONT_SIZE / 1.5, 
			this.systolicPlotRect.top + this.systolicPlotRect.height / 2, 
			BPC.str("STR_SYSTOLIC".toUpperCase()).split("").join("\n").toUpperCase()
		).attr(this.settings.VAxisTitlesAttr);
		
		this.paper.text(
			NS.Constants.FONT_SIZE / 1.5, 
			this.diastolicPlotRect.top + this.diastolicPlotRect.height / 2, 
			BPC.str("STR_DIASTOLIC").split("").join("\n").toUpperCase()
		).attr(this.settings.VAxisTitlesAttr);
	};
	
	/**
	 * Draws the horizontal lines at the bottom of each sub-plot and the time
	 * labels at the bottom of the chart. 
	 */
	LongGraph.prototype.drawXAxis = function() 
	{	
		this.paper.path(
			"M" + [
				this.systolicPlotRect.left, 
				this.systolicPlotRect.top + this.systolicPlotRect.height
			] + 
			"h" + this.systolicPlotRect.width + 
			"M" + [
				this.diastolicPlotRect.left, 
				this.diastolicPlotRect.top + this.diastolicPlotRect.height
			] + 
			"h" + this.diastolicPlotRect.width
		).attr({
			stroke : NS.Constants.COLOR_GREY_4
		}).crisp();
		
		// X-axis labels
		switch ( this.TimeIterator.getTimeStep() ) {
			case "Hour":
				this.drawXLabelsForHours();
				break;
			case "Day":
				this.drawXLabelsForDays();
				break;
			case "Week":
				this.drawXLabelsForWeeks();
				break;
			case "Month":
				this.drawXLabelsForMonths();
				break;
			case "Year":
				this.drawXLabelsForYears();
				break;
		}
	};
	
	/**
	 * Displays the label on the X axis in case we use year precision.
	 * The months for each year might be rendered on top as single letters if 
	 * the space is enough.
	 */
	LongGraph.prototype.drawXLabelsForYears = function() 
	{
		var current,
			iterator = this.TimeIterator,
			diff  = new XDate(iterator.startTime).diffYears(iterator.endTime),
			diffM = new XDate(iterator.startTime).diffMonths(iterator.endTime),
			width = this.plotRect.width,
			step  = width / diff,
			stepM = width / diffM,
			showMonths = stepM > 13,
			txt,
			i = 0;
		
		// If the space is enough use years + months!
		if (showMonths) {
			this.drawXLabelsForMonths();
			return;
		}
		
		iterator.rewind();
		
		while ( iterator.hasNextYear() ) {
			current = iterator.current();
					
					// full year like "2345"
			txt =   step >= 30 ? current.date.toString("yyyy") :
					
					// short year like "45"
					step >= 15 ? current.date.toString("yy"  ) :
					step >= 10  ? 
						
						// short year like "45" for every second tick
						i % 2 == 0 ? current.date.toString("yy"  ) : "" : 
						
						// short year like "45" for every third tick
						i % 3 == 0 ? current.date.toString("yy"  ) : "" ;
			i++;
			
			if (txt) {
				this.paper.text(
					this.plotRect.left + width * current.pos + step / 2,
					this.plotRect.bottom + 12,
					txt
				).attr(this.settings.XAxisLabelsAttr);
			}
			
			iterator.nextYear();
		}
	};
	
	/**
	 * Displays the label on the X axis in case we use month precision.
	 * The year is rendered on second line below the month labels. Multiple 
	 * years might be displayed, depending on the chart's interval, but they are 
	 * properly positioned to match the used length of each year.
	 */
	LongGraph.prototype.drawXLabelsForMonths = function() 
	{
		var current,
			inst = this,
			iterator = inst.TimeIterator,
			diff = new XDate(iterator.startTime).diffMonths(iterator.endTime),
			width = inst.plotRect.width,
			step = width / diff,
			year,
			years = {},
			yearsCount = 0,
			yearStart = inst.plotRect.left,
			txt;
		
		iterator.rewind();
		
		while ( iterator.hasNextMonth() ) {
			current = iterator.current();
			
			txt =   step >= 100 ? current.date.toString("MMMM") :
					step >= 30  ? current.date.toString("MMM" ) :
					step >= 12  ? current.date.toString("MMM").substr(0, 1) : 
					"";
			
			year = String( current.date.getFullYear() );
			if ( !years.hasOwnProperty(year) ) {
				years[year] = 0;
			}
			years[year]++;
			yearsCount++;
			
			if (txt) {
				inst.paper.text(
					inst.plotRect.left + width * current.pos + step / 2,
					inst.plotRect.bottom + 12,
					txt
				).attr(inst.settings.XAxisLabelsAttr);
			}
			
			iterator.nextMonth();
		}
		
		// also show the years on the next line
		$.each(years, function(label, weight) {
			var w = width / yearsCount * weight,
				x = yearStart + w / 2;
			inst.paper.text(
				x,
				inst.plotRect.bottom + 30,
				label
			).attr(inst.settings.XAxisLabelsAttr);
			yearStart += w;
		});
	};
	
	/**
	 * Displays the label on the X axis in case we use week precision.
	 */
	LongGraph.prototype.drawXLabelsForWeeks = function() 
	{
		var current,
			iterator = this.TimeIterator,
			diff = new XDate(iterator.startTime).diffWeeks(iterator.endTime),
			step = this.plotRect.width / diff,
			week;
		
		iterator.rewind();
		
		while ( iterator.hasNextWeek() ) {
			current = iterator.current();
			week = Math.ceil(current.date.getDate() / 7);
			
			if (week < 5) {
				this.paper.text(
					this.plotRect.left + this.plotRect.width * current.pos + 
						step / 2,
					this.plotRect.bottom + 12,
					current.date.toString("MMM yyyy") + " week " + week + ""
				).attr(this.settings.XAxisLabelsAttr);
			}
			
			iterator.nextWeek();
		}
	};
	
	/**
	 * Displays the label on the X axis in case we use day precision.
	 */
	LongGraph.prototype.drawXLabelsForDays = function() 
	{
		var current,
			iterator = this.TimeIterator,
			diff = new XDate(iterator.startTime).diffDays(iterator.endTime),
			step = this.plotRect.width / diff;
		
		iterator.rewind();
		
		while ( iterator.hasNextDay() ) {
			current = iterator.current();
			
			this.paper.text(
				this.plotRect.left + this.plotRect.width * current.pos + 
					step / 2,
				this.plotRect.bottom + 12,
				current.date.toString("dd MMM yyyy")
			).attr(this.settings.XAxisLabelsAttr);
			
			iterator.nextDay();
		}
	};
	
	/**
	 * Displays the label on the X axis in case we use hour precision.
	 * If the labels are too many for the given chart width, then only the odd 
	 * ones are displayed. The date in format "dd MMM yyyy" is rendered on 
	 * second line below the hour labels. Multiple dates might be displayed,
	 * depending on the chart's interval, but they are properly positioned 
	 * to match the used length of each day.
	 */
	LongGraph.prototype.drawXLabelsForHours = function() 
	{
		var current,
			inst     = this,
			iterator = this.TimeIterator,
			diff     = new XDate(iterator.startTime).diffHours(iterator.endTime),
			width    = this.plotRect.width,
			step     = this.plotRect.width / diff,
			i        = 0;
			
		var day,
			days = {},
			daysCount = 0,
			dayStart = this.plotRect.left;
		
		iterator.rewind();
		
		while ( iterator.hasNextHour() ) {
			current = iterator.current();
			
			day = current.date.toString("dd MMM yyyy");
			if ( !days.hasOwnProperty(day) ) {
				days[day] = 0;
			}
			days[day]++;
			daysCount++;
			
			if (i++ % 2 == 0 || step > 40) {
				this.paper.text(
					this.plotRect.left + width * current.pos + step / 2,
					this.plotRect.bottom + 12,
					current.date.toString("Htt")
				).attr(this.settings.XAxisLabelsAttr);
			}
			
			iterator.nextHour();
		}
		
		// Draw day dates
		$.each(days, function(label, weight) {
			var w = width / daysCount * weight,
				x = dayStart + w / 2;
			inst.paper.text(
				x,
				inst.plotRect.bottom + 30,
				label
			).attr(inst.settings.XAxisLabelsAttr);
			dayStart += w;
		});
	};
	
	// Export this class to the namespace
	NS.LongGraph = LongGraph;
	
})(BPC, jQuery);
