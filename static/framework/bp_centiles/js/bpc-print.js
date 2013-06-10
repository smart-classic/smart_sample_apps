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
		
		// Add other things to do upon document loading here...
		
	}); // end document.ready handler
	
	SMART.fail (function () {
		initPrintApp ( BPC.getSamplePatient(), true );
	});
	
	function initPrintApp( patient, isDemo ) {
		BPC.initPatient( patient );
		console.log( patient, BPC );
		
		drawHeader( "#header", patient );
		drawShortGraph( "", patient );
		drawLongGraph( "", patient );
		drawTable( "#table-view", patient );
	}
	
	function drawShortGraph( container, patient ) {}
	function drawLongGraph( container, patient ) {}
	
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
		
		// Generate the table output
		$(container).setTemplateElement("header-template").processTemplate(tplData);
	}
	
	function drawTable( container, patient ) {
		
		// Apply filters 
		var p = patient.applyFilters ();
		
		// Reverse the data order
		p.data.reverse();
		
		console.log(p);
		
		// Generate the table output
		$(container).setTemplateElement("template").processTemplate(p);
	}
});