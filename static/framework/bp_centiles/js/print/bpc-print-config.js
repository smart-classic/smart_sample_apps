(function(NS) {
	
	// Configuration constants
	// =========================================================================
	NS.Constants = {
		FONT_FAMILY    : "Verdana, Tahoma, Calibri, sans-serif",
		FONT_SIZE      : 12,
		COLOR_GREY_0   : "#222222",
		COLOR_GREY_1   : "#515151",
		COLOR_GREY_2   : "#636363",
		COLOR_GREY_3   : "#787878",
		COLOR_GREY_4   : "#929292",
		COLOR_GREY_5   : "#c8c8c8",
		COLOR_GREY_6   : "#d6d6d6",
		COLOR_GREY_7   : "#e3e3e3",
		COLOR_WHITE    : "#FFFFFF"
	};
	
	// Configuration Settings
	// =========================================================================
	NS.printSettings = {
		maxTableRows : 8,
		isBCH : false     // triggers print page customizations for Boston Childrens Hospital
	};
	
	// SHORT-VIEW Settings
	// =========================================================================
	NS.printSettings.shortGraph = {
		topgutter      : NS.Constants.FONT_SIZE * 1.5 + 3, // enough to contain a circle at 100%
		leftgutter     : 30, 
		rightgutter    : 0,
		bottomgutter   : 40,
		leftpadding    : 15, 
		rightpadding   : 15,
		gridRows       : 16, 
		gridCols       : 0, 
		max            : 160, // maximum value of the data (plotted on the Y axis); this is either mmHg or percentile
		vLabels        : 16,  // number of labels to display for the Y axis
		gridColor      : "#CECECE",
		abbreviationDefault: "-", // Default zone abbreviation and label
		
		// data circles
		dotAttr : {
			r              : NS.Constants.FONT_SIZE * 1.4, 
			fill           : NS.Constants.COLOR_WHITE,
			stroke         : NS.Constants.COLOR_GREY_3,
			"stroke-width" : 1.1
		},
		dotAttrPrehypertensive : {
			r              : NS.Constants.FONT_SIZE * 1.4, 
			fill           : NS.Constants.COLOR_WHITE,
			stroke         : NS.Constants.COLOR_GREY_1,
			"stroke-width" : 3
		},
		dotAttrHypertensive : {
			r              : NS.Constants.FONT_SIZE * 1.4, 
			fill           : NS.Constants.COLOR_WHITE,
			stroke         : "#000",
			"stroke-width" : 3
		},
		
		// data labels inside the circles
		dotLabelAttr : {
			"font-size"   : NS.Constants.FONT_SIZE * 0.9,
			"font-family" : NS.Constants.FONT_FAMILY,
			fill          : NS.Constants.COLOR_GREY_1,
			"font-weight" : "bold"
		},
		
		// Y axis labels
		VAxisLabelsAttr : {
			"font-size"   : NS.Constants.FONT_SIZE * 0.82,
			"font-family" : NS.Constants.FONT_FAMILY,
			fill          : NS.Constants.COLOR_GREY_3
		},
		
		// X axis labels
		HAxisLabelsAttr : {
			"font-size"   : NS.Constants.FONT_SIZE,
			"font-family" : NS.Constants.FONT_FAMILY,
			fill          : NS.Constants.COLOR_GREY_3
		}
	};
	
	// LONG-VIEW Settings
	// =========================================================================
	NS.printSettings.longGraph = {
		
		leftgutter   : NS.Constants.FONT_SIZE * 5, 
		rightgutter  : NS.Constants.FONT_SIZE * 3,
		bottomgutter : NS.Constants.FONT_SIZE * 4,
		topgutter    : 15,
		plotsMargin  : 20, // The distance between the two plots
		leftpadding  : 0, 
		rightpadding : 0,
		
		// data circles
		dotAttr : {
			r              : 5, 
			fill           : "rgba(255, 255, 255, 0.2)",
			stroke         : NS.Constants.COLOR_GREY_3,
			"stroke-width" : 2
		},
		dotAttrHypertensive : {
			r              : 5, 
			fill           : "rgba(255, 255, 255, 0.2)",
			stroke         : "#000",
			"stroke-width" : 4
		},
		dotAttrPrehypertensive : {
			r              : 5, 
			fill           : "rgba(255, 255, 255, 0.2)",
			stroke         : NS.Constants.COLOR_GREY_1,
			"stroke-width" : 3
		},	
		
		// Y axis labels
		VAxisLabelsAttr : {
			"font-size"   : NS.Constants.FONT_SIZE * 0.92,
			"font-family" : NS.Constants.FONT_FAMILY,
			fill          : NS.Constants.COLOR_GREY_3
		},
		
		// Y axis titles
		VAxisTitlesAttr : {
			"font-size"   : NS.Constants.FONT_SIZE,
			"font-family" : NS.Constants.FONT_FAMILY,
			fill          : NS.Constants.COLOR_GREY_4
		},
		
		// X axis labels
		XAxisLabelsAttr : {
			"font-size"   : NS.Constants.FONT_SIZE * 0.92,
			"font-family" : NS.Constants.FONT_FAMILY,
			fill          : NS.Constants.COLOR_GREY_3
		}
	};

})( window.BPC || {} );
	
