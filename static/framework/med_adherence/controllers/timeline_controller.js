/**
 * @tag controllers, home
 */
Smart.Controllers.KeybindController.
extend('MedList.Controllers.TimelineController',
/* @Static */
{
},
/* @Prototype */
{
	init: function() {

    },
	"timeline.view subscribe": function(called, meds) {
		this.events = this.timelineData(meds);
		this.updateTimeline();
	},
	
	updateTimeline : function() {
		var tl_el = this.element.get(0);
        var eventSource1 = new Timeline.DefaultEventSource();
        var theme1 = Timeline.ClassicTheme.create();
        theme1.autoWidth = true;

      
        var eventData = this.events;
      
	      var before_time = this.earliestEvent(eventData.events);//new Date(Date.UTC(2008, 0, 1));
	      var after_time= this.latestEvent(eventData.events);//new Date(Date.UTC(2010, 0, 1));
	      
	      this.replaceUndefinedDates(eventData.events);
	      
	      var one_day=1000*60*60*24;
	      var numDays = Math.max(30, (Date.parse(after_time).getTime() - Date.parse(before_time).getTime()) / one_day);
	      
	      var middle = Date.parse(before_time).addDays(numDays / 2);
	      var width = $(document).width() / numDays * 12;
	      var bandInfos = [
	          Timeline.createBandInfo({
	              width:          100, // set to a minimum, autoWidth will then adjust
	              intervalUnit:   Timeline.DateTime.MONTH, 
	              intervalPixels: width * 1.8,
	              eventSource:    eventSource1,
	              date:           middle,
	              theme:          theme1,
	              layout:         'original'  // original, overview, detailed
	          })
	      ];
	                                                      
	      // create the Timeline
	      this.tl = Timeline.create(tl_el, bandInfos, Timeline.HORIZONTAL);
	      var url = '.';
	      eventSource1.loadJSON(eventData, url);
	      this.tl.layout();	
	},

	timelineData : function(meds) {
		if (meds.length === 0) return;
		
		var events = [];
		var rownum=-1;
		             
		meds[0].Class.findDispenseEvents();
		
		for (var i = 0; i < meds.length; i++) {
			var med_events = meds[i].toTimelineEvents();
			if (med_events.length > 0) rownum++;
			for (var j = 0; j< med_events.length; j++)
			{
				if (med_events[j].instant === false) rownum++;
				med_events[j].trackNum = ""+rownum;
				events.push(med_events[j]);	
			}
		}
		
		var ret = {};
		ret.dateTimeFormat = 'iso8601';
		ret.wikiURL = 'http://smartplatforms.org';
		ret.wikiSection = '#';
		ret.events = events;
		
		return ret;
		
	},
	
	earliestEvent : function(events) {
		var d = new Date(); // start with today's date as the assumption to disprove.
		for (var i = 0; i < events.length; i++ ) {
			if (events[i].start < d)
				d = events[i].start;			
		}
		return d.toISOString().substring(0,10);
	},
	latestEvent : function(events) {
		var d = new Date(1000,1,1); // start with today's date as the assumption to disprove.
		for (var i = 0; i < events.length; i++ ) {
			var ev_end = events[i].end ? events[i].end : events[i].start;
			if (ev_end > d)
				d = ev_end;			
		}
		return d.toISOString().substring(0,10);
	},
	replaceUndefinedDates : function(events) {
		for (var i = 0; i < events.length; i++ ) {
			if (typeof(events[i].start)=="object" && events[i].start !== null)
				events[i].start=events[i].start.toISOString().substring(0,10);
			if (typeof(events[i].end)=="object"&& events[i].end !== null)
				events[i].end=events[i].end.toISOString().substring(0,10);
			
		}
	},
	

});
