/**
 * @tag controllers, home
 */
Smart.Controllers.KeybindController.
extend('MedList.Controllers.MedListController',
/* @Static */
{
},
/* @Prototype */
{
	init: function() {
	
		SMART.on("foregrounded", function() {
			$("#TheList").click();		
			$("#TheList").click();		
		});

	
		var v = this.view('init', {} );
		this.element.html(v);
		this.expanded = false;
		this.slideDelay = 60;
		this.selectedRow = 0;
		var _this = this;
		
		$("#MedListTabs").tabs();

		$('#MedListTabs').bind('tabsshow', this.callback(function(event, ui) {
		    $("#tl").med_list_timeline();	

		    if (ui.panel.id == "tabs-timeline") {
		        OpenAjax.hub.publish("timeline.view",this.meds)
		    }		    
		}));
		
		this.expandedElt = $("<div id='ExpandedMeds'><img src='/framework/med_list/images/ajax-loader.gif'/></div>");
		this.element.append(this.expandedElt);
		
		// It would be nice to have these automatically unbind on teardown.
		this.bindKeys("j", "k");
		$("#TheList").click();		
},

    ".medtable TR click" : function(el, ev) {
         $old_sel = $(".medtable TR.selected");
         this.moveSel($old_sel, el);
    },
    
	"#ExpandMeds, #TheList click": function() {
    	this.expanded = !this.expanded;
    	this.expand_list(!this.expanded);
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
		Smart.Models.Med.delete_one(
				el.closest(".med").model().rdf.med.value.path,
				function() {
					_this.expand_list(false);	
					$("#MedListTabs").tabs('select', 0);
				});
	},


	moveSel : function($old_sel, $new_sel) {
		if ($new_sel.length !== 0) {
			$old_sel.removeClass("selected");
			$("TD:first-child", $old_sel).html("");
			$("TD:first-child", $new_sel).html(">");
			$new_sel.addClass("selected");

			this.selectedRow = $(".medtable tr").index($new_sel);
			
		    $("#MedDetails").html("");
/*					this.view('table',
					{
						data: Smart.Models.MedDetails.
							getDetails(this.meds[this.selectedRow-1])
					}));
			
*/
		}
	},
	expand_list : function(status){
    	if (status) {
			$("#ExpandedMeds").fadeOut(this.slideDelay);
			$("#ExpandMeds").html("+");
			$("#MedDetails").html("");
    	} else {
			this.expandedElt.html("<img src='/framework/med_list/images/ajax-loader.gif'/>");
			$("#ExpandMeds").html("-");
			$("#MedDetails").html("");

			this.selectedRow = 0;
			Smart.Models.Med.get(
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
						//SMART.adjust_size();


    			     }), 
    			     function(){alert("Error!");});
    	}	
	}
});
