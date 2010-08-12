/**
 * @tag controllers, home
 */
SmartMedDisplay.Controllers.KeybindController.
extend('SmartMedDisplay.Controllers.MedListController',
/* @Static */
{
},
/* @Prototype */
{
	init: function() {
		var v = this.view('init', {} );
		this.element.html(v);
		this.expanded = false;
		this.expandedElt = $("#ExpandedMeds");
		this.slideDelay = 60;
		this.selectedRow = 0;
		var _this = this;
		
		$("#MedListTabs").tabs();

		$('#MedListTabs').bind('tabsshow', this.callback(function(event, ui) {
		    if (ui.panel.id == "tabs-timeline") {        
	 			this.updateTimeline();
		    }		    
		}));
		
		if (this.expandedElt.length === 0) {
			this.expandedElt = $("<div id='ExpandedMeds'></div>");
			$("#ExpandMeds").parent().append(this.expandedElt);
		}

		$('#AddMedsButton').click(function() {
			
			var cb = function(){
				_this.expand_list(false);	
				$("#MedListTabs").tabs('select', 0);
				return false;
			};
			
			if ($('#AddExternalID').val() == "")
			{
				SmartMedDisplay.Models.Med.post($('#AddMedsText').val(), cb);
			}
			else 
			{
				SmartMedDisplay.Models.Med.put($('#AddMedsText').val(), 
											   $('#AddExternalID').val(),
											   cb);				
			}
		});

		$('#DeleteMedsButton').click(function() {
			SmartMedDisplay.Models.Med.delete_all(function(){
				_this.expand_list(false);	
				$("#MedListTabs").tabs('select', 0);
			});
			return false;
			});	
		
		// It would be nice to have these automatically unbind on teardown.
		this.bindKeys("j", "k");
		
		$("#TheList").click();		
        
},

    "#DestroyButton click" : function() {
        	this.element.controller().destroy();
        },
        
    ".medtable TR click" : function(el, ev) {
         $old_sel = $(".medtable TR.selected");
         this.moveSel($old_sel, el);
    },
    
	"#ExpandMeds, #TheList click": function() {
    	this.expanded = !this.expanded;
    	this.expand_list(!this.expanded);
	},
	
	expand_list : function(status){
    	if (status) {
			$("#ExpandedMeds").fadeOut(this.slideDelay);
			$("#ExpandMeds").html("+");
			$("#MedDetails").html("");
    	} else {
			this.expandedElt.hide();
			$("#ExpandMeds").html("-");
			$("#MedDetails").html("");

			this.selectedRow = 0;
			SmartMedDisplay.Models.Med.get(
    				this.callback(function(data) 
    				{
    					this.meds = data;
 						var v = this.view('meds', {meds: data});
						this.expandedElt.html(v).fadeIn(this.slideDelay);
						
						var $old_sel = $(".medtable tr.selected");
				
						if ($old_sel.length == 0) {
							$old_sel = $(".medtable tr:first")
						}
						
						this.moveSel($old_sel, $old_sel);
    			     }), 
    			     function(){alert("Error!");});
    	}
		
	},
	
	key_j : function () {
		var $old_sel = $(".medtable tr.selected");
		var $new_sel = $old_sel.next();
		this.moveSel($old_sel, $new_sel);
		
	},
	key_k : function () {
		var $old_sel = $(".medtable tr.selected");
		var $new_sel = $old_sel.prev();
		this.moveSel($old_sel, $new_sel);	
	},
	".delete_med click": function(el) {
		var _this = this;
		SmartMedDisplay.Models.Med.delete_one(
				el.closest(".med").model().rdf.med.value.path,
				function() {
					_this.expand_list(false);	
					$("#MedListTabs").tabs('select', 0);
				});
	},
	".spl click": function(el) {
		var _this = this;
		var med = el.closest(".med").model();
		med.load_spl_rdf(
				function(){
					$("#image-overlay").html("");
					
	        		
					for (var i =0 ; i < med.spl.images.length; i++)
						$("#image-overlay").append("<img src='"+med.spl.images[i]+"'/><br>");
					
					
					$("#image-overlay").dialog({
						width: "100%",
						modal: true
					});
					});
	},

	moveSel : function($old_sel, $new_sel) {
		if ($new_sel.length !== 0) {
			$old_sel.removeClass("selected");
			$("TD:first-child", $old_sel).html("");
			$("TD:first-child", $new_sel).html(">");
			$new_sel.addClass("selected");

			this.selectedRow = $(".medtable tr").index($new_sel);
			
			$("#MedDetails").html(
					this.view('table',
					{
						data: SmartMedDisplay.Models.MedDetails.
							getDetails(this.meds[this.selectedRow])
					}));
			
		}
	},
	timelineData : function() {
		var events = [];
		var rownum=-1;
		             
		for (var i = 0; i < this.meds.length; i++) {
			var med_events = this.meds[i].toTimelineEvents();
			if (med_events.length > 0) rownum++;
			for (var j = 0; j< med_events.length; j++)
			{
				if (med_events[j].instant === false) rownum++;
				med_events[j].trackNum = ""+rownum;
				med_events[j].description += "And tracknum "+rownum;
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
			if (typeof(events[i].start)=="object")
				events[i].start=events[i].start.toISOString().substring(0,10);
			if (typeof(events[i].end)=="object")
				events[i].end=events[i].end.toISOString().substring(0,10);
			
		}
	},
	
	updateTimeline : function() {
		
        var tl_el = $("#tl").get(0);

//        Timeline.DefaultEventSource.Event.prototype.fillInfoBubble = function(element, theme, labeller) {
//        	var med = this._obj.med;
//        	med.load_spl_rdf(function() {
//        		var data = "Refill.";
//        		if  (med.spl.pill_image!== undefined)
//        			data += "<img src='"+med.spl.pill_image+"'/>";
//        		jQuery(element).html(data)
//        		
//        	});
//        	
//          }

        
        var eventSource1 = new Timeline.DefaultEventSource();
        
        var theme1 = Timeline.ClassicTheme.create();
//        theme1.event.tape.height=10;
//        theme1.event.track.height = 10;
//        theme1.event.track.gap = 2;
//        theme1.event.label.offsetFromLine = 100;
//        theme1.event.instant.iconWidth = 2;
//        theme1.event.instant.iconHeight = 2;        
//        theme1.event.instant.icon = "/framework/smart_med_display/images/1x1.png";
        
        theme1.autoWidth = true; // Set the Timeline's "width" automatically.
                                 // Set autoWidth on the Timeline's first band's theme,
                                 // will affect all bands.


        
        var eventData = this.timelineData();
        
//      theme1.timeline_start = this.earliestEvent(eventData.events);//new Date(Date.UTC(2008, 0, 1));
        //       theme1.timeline_stop  = this.latestEvent(eventData.events);//new Date(Date.UTC(2010, 0, 1));
        var before_time = this.earliestEvent(eventData.events);//new Date(Date.UTC(2008, 0, 1));
        var after_time= this.latestEvent(eventData.events);//new Date(Date.UTC(2010, 0, 1));
        
        this.replaceUndefinedDates(eventData.events);
        
        var one_day=1000*60*60*24;
        var numDays =  (Date.parse(after_time).getTime() - Date.parse(before_time).getTime()) / one_day;
        
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
	}

});
