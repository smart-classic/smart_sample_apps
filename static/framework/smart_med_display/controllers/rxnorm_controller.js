/**
 * @tag controllers, home
 */
jQuery.Controller.
extend('SmartMedDisplay.Controllers.RxnormController',
/* @Static */
{
},
/* @Prototype */
{
	init: function() {
		this.element.html("");
   
	},

    "#DestroyButton click" : function() {
        	this.element.controller().destroy();
        },
        
    ".medtable TR click" : function(el, ev) {
         $old_sel = $(".medtable TR.selected");
         this.moveSel($old_sel, el);
    },
    
	"#ExpandMeds, #TheList click": function() {
				SmartMedDisplay.Models.Med.get(
				this.callback(function(data) 
				{
					this.expanded = !this.expanded;
					$("#ExpandMeds").html(this.expanded? "-" : "+");

					if (!this.expanded){
						$("#ExpandedMeds").fadeOut(this.slideDelay);
					} else {
						var v = this.view('meds', {meds: data});
						this.expandedElt.hide().html(v).fadeIn(this.slideDelay);
						this.selectedRow = 0;
					}
			     }), 
			     function(){alert("Error!");});

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
	
	moveSel : function($old_sel, $new_sel) {
		if ($new_sel.length !== 0) {
			$old_sel.removeClass("selected");
			$("TD:first-child", $old_sel).html("");
			$("TD:first-child", $new_sel).html(">");
			$new_sel.addClass("selected");
		}
		
	}
	
});
