/**
 * @tag controllers, home
 */
Smart.Controllers.KeybindController.
extend('MedCalendar.Controllers.MedCalendarController',
/* @Static */
{
},
/* @Prototype */
{
	init: function() {
	
		SMART.message_receivers = {
			foreground: function() {
			}
		};

	
		var v = this.view('init', {} );
		this.element.html(v);
		this.expanded = false;
		this.slideDelay = 60;
		this.selectedRow = 0;
		var _this = this;
		
		$("#MedListTabs").tabs();

		$('#MedListTabs').bind('tabsshow', this.callback(function(event, ui) {
		    $("#tl").med_calendar_timeline();	

		    if (ui.panel.id == "tabs-timeline") {
		        OpenAjax.hub.publish("timeline.view",this.meds)
		    }		    
		}));
		
		this.expandedElt = $("<div id='ExpandedMeds'><img src='images/ajax-loader.gif'/></div>");
		this.element.append(this.expandedElt);
		
		
		this.instructionMap = {
			QD: 'Daily',
			BID: 'Twice a Day',
			TID: 'Three times a day',
			Q4H: 'Every 4 hours',
			Q6H: 'Every 6 hours',
			QAM: 'Every morning',
			QPM: 'Every evening',
			QID: 'four times a day',
			Q1H: 'every hour',
			Q2H: 'every two hours',
			Q3H: 'every three hours',
			Q8H: 'every eight hours',
			Q24H: 'every 24 hours',
			Q72H: 'every 72 hours',
			Q12H: 'every twelve hours',
			Q15MIN: 'every 15 minutes',
			Q20MIN: 'every 20 minutes',
			QDAY: 'once a day',
			QHS: 'every evening',
			QAC: '(Latin ante cibum) means before every meal',
			QPC: '(Latin pos cibos) means after every meal',
			QMNTH: 'every month',
			QMONTH: 'every month',
			QMWF: 'every Monday, Wednesday, and Friday',
			QOD: 'every other day',
			QWEEK: 'every week',
			QMON: 'every Monday',
			QTUE: 'every Tuesday',
			QTUES: 'every Tuesday',
			QWED: 'every Wednesday',
			QTHU: 'every Thursday',
			QTHUR: 'every Thursday',
			QFRI: 'every Friday',
			QSAT: 'every Saturday',
			QSHF: 'every Shift (various by Inst, Location)'
		};
		
		
		this.expand_list(false);
	},
	
	expand_list : function(status){
    	if (status) {
			$("#ExpandedMeds").fadeOut(this.slideDelay);
			$("#ExpandMeds").html("+");
			$("#MedDetails").html("");
    	} else {
			this.expandedElt.html("<img src='images/ajax-loader.gif'/>");
			$("#ExpandMeds").html("-");
			$("#MedDetails").html("");
			
			this.selectedRow = 0;
			
			Smart.Models.Med.get(
    				this.callback(function(meds) 
    				{
	
						var rownum = -1;
						var events = [];
						
						
						meds[0].Class.findDispenseEvents = function () {
							
							var dispenses_by_med = {};

							var fulfillments = this.rdf
							    .where("?med rdf:type sp:Medication")
							    .where("?med sp:fulfillment ?f")
							    .where("?f dc:date ?d")
							    .optional("?f sp:dispenseQuantity ?q")
								.optional("?f sp:dispenseDaysSupply ?s")

							for (var i = 0; i < fulfillments.length; i++)
							{
								var ds = [];

								var devent = {};
								
								var d = $.trim(fulfillments[i].d.value);
								var d = Date.parse(d.substring(0,10));

								devent.supply = fulfillments[i].s.value;
								devent.quantity = fulfillments[i].q.value;
								devent.title = devent.quantity;
								devent.description = d.toString('M/d/yyyy') + ": Dispensed " + fulfillments[i].q.value;
								devent.start = d;
								devent.end = d;

								devent.instant = true;
								m = SMART.node_name(fulfillments[i].med);
								if (dispenses_by_med[m] === undefined )
									dispenses_by_med[m] = [];

								dispenses_by_med[m].push(devent);
							}

							var sort_ds = function(a,b){return (a.start>b.start)-(a.start<b.start);};
							jQuery.each(dispenses_by_med, function(k, v) {
								dispenses_by_med[k].sort(sort_ds)
							});

							this.dispenses_by_med = dispenses_by_med;
						}
						
						meds[0].Class.findDispenseEvents();

						for (var i = 0; i < meds.length; i++) {
							
							var med_events = meds[i].toTimelineEvents();
							
							if (med_events.length > 0) {
								meds[i].start_date = new Date(med_events[0].start.getTime());
							}
							
							for (var j = 0; j< med_events.length; j++)
							{
								
								if (med_events[j].supply != undefined) {
									
									var days = parseInt(med_events[j].supply, 10);
									var currentDate = med_events[j].start.getDate();
								
									if (med_events[j].end == undefined) 
										med_events[j].end = new Date(med_events[j].start.getTime());
									
									med_events[j].end.setDate(currentDate + days);
									
									meds[i].end_date = med_events[j].end;
								} 
								
								
								if (med_events[j].instant === false) rownum++;
								med_events[j].trackNum = ""+rownum;
								events.push(med_events[j]);	
							}
							
							var now = (new Date()).getTime();
							if (meds[i].start_date != undefined && meds[i].start_date.getTime() < now && (meds[i].end_date == undefined || meds[i].end_date.getTime() > now)) {
								meds[i].isExpired = 'current';
							} else {
								meds[i].isExpired = 'expired';
							}
							
							$.each(this.instructionMap, function(key, value) {
								
								meds[i].instructions = meds[i].instructions.replace(key.toLowerCase(), value, 'gi');
								
							});
						}
						
    					this.meds = meds;
 						var v = this.view('meds', {meds: meds});
						this.expandedElt.html(v).fadeIn(this.slideDelay);

    			     }), 
    			     function(){alert("Error!");});
    	}	
	}
});
