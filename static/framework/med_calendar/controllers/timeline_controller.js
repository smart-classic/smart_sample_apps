/**
 * @tag controllers, home
 */
Smart.Controllers.KeybindController.
extend('MedCalendar.Controllers.TimelineController',
/* @Static */
{
},
/* @Prototype */
{
	init: function() {
		
		$("#ical").bind("click",function(el, ev) {
			
			var ical = "";
			
			for (var i = 0; i < this.events.events.length; i++) {
				// put events into ical format and send to server where they can download the file.
			}
			
			
		});
		
    },
	"timeline.view subscribe": function(called, meds) {
		this.events = this.timelineData(meds);
		this.updateTimeline();
	},
	
	updateTimeline : function() {
      
        var eventData = this.events;
		
		var calEvents = [];
		var lastDate = undefined;
		
		for (var i = 0; i < eventData.events.length; i++) {
			var event = {};

			event.title = eventData.events[i].drugTitle;
			event.start = eventData.events[i].start;
			event.className = 'startevent';
			event.i = i;
			
			if (lastDate == undefined || event.start.getTime() > lastDate.getTime()) {
				lastDate = event.start;
			}

			calEvents.push(event);
			
			if (eventData.events[i].end) {
				event = {};
				
				event.title = eventData.events[i].drugTitle;
				event.start = eventData.events[i].end;
				event.className = 'endevent';
				event.i = i;

				if (lastDate == undefined || event.start.getTime() > lastDate.getTime()) {
					lastDate = event.start;
				}

				calEvents.push(event);
			}
		}
		
		console.log(calEvents);
		
		if (!this.created) {
			
			var pop = function( calEvent, jsEvent, view ) {

				var offset = $(jsEvent.target).offset();

				var pop = $('#popover');

				if (!(new RegExp('undefined')).test(eventData.events[calEvent.i].description)) {
					$('.description', pop).text(eventData.events[calEvent.i].description);
				} else {
					$('.description', pop).text('');
				}

				pop.show();
				$('.title', pop).text(eventData.events[calEvent.i].drugTitle);
				$('.start', pop).text(eventData.events[calEvent.i].start.toDateString());
				$('.end', pop).text(eventData.events[calEvent.i].end.toDateString());

				offset.left = offset.left - pop.width() - 30;
				$('.arrow', pop).addClass('right').removeClass('left');
				
				if (offset.left < 0) {
					$('.arrow', pop).addClass('left').removeClass('right');
					offset.left = offset.left + pop.width() + 30 + $(jsEvent.target).width();
				}

				pop.offset(offset);
			};
			
        	$('#tl').fullCalendar({
	            header: {
	                left: 'prev,next today',
	                center: 'title',
	                right: 'month,basicWeek,basicDay'
	            },
	            events: calEvents,
				eventClick: pop,
				eventMouseover: pop,
				eventMouseout: function( calEvent, jsEvent, view ) {
					
					$('#popover').hide();
				}
	        }).fullCalendar('gotoDate', lastDate.getFullYear(), lastDate.getMonth());
			this.created = true;
		}

	},

	timelineData : function(meds) {
		if (meds.length === 0) return;
		
		var events = [];
		var rownum=-1;
		             
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
			
			for (var j = 0; j< med_events.length; j++)
			{
				if (med_events[j].supply != undefined) {
					
					var days = parseInt(med_events[j].supply, 10);
					var currentDate = med_events[j].start.getDate();
				
					if (med_events[j].end == undefined) {
						med_events[j].end = new Date(med_events[j].start.getTime());
					} else {
						med_events[j].end = new Date(med_events[j].end.getTime());
					}
					
					med_events[j].end.setDate(currentDate + days);

					med_events[j].drugTitle = meds[i].properName();

					events.push(med_events[j]);
				}
			}
		}
		
		var ret = {};
		ret.dateTimeFormat = 'iso8601';
		ret.wikiURL = 'http://smartplatforms.org';
		ret.wikiSection = '#';
		ret.events = events;
		
		return ret;
		
	},
	dateToISO: function(date) {
	    var r = date.toISOString();
	    if (r.match(/^"/) !== null) {
              return r.substring(1, 11);
            }
             return r.substring(0,10);
	},
	earliestEvent : function(events) {
		var d = new Date(); // start with today's date as the assumption to disprove.
		for (var i = 0; i < events.length; i++ ) {
			if (events[i].start < d)
				d = events[i].start;			
		}
		return this.dateToISO(d);
	},
	latestEvent : function(events) {
		var d = new Date(1000,1,1);
		for (var i = 0; i < events.length; i++ ) {
			var ev_end = events[i].end ? events[i].end : events[i].start;
			if (ev_end > d)
				d = ev_end;			
		}
		return this.dateToISO(d);
	},
	replaceUndefinedDates : function(events) {
		for (var i = 0; i < events.length; i++ ) {
			if (typeof(events[i].start)=="object" && events[i].start !== null)
				events[i].start=this.dateToISO(events[i].start);
			if (typeof(events[i].end)=="object"&& events[i].end !== null)
				events[i].end=this.dateToISO(events[i].end);
			
		}
	}
});
