jQuery.Controller.extend('MedAdherence.Controllers.MainController',
/* @Static */
{
    onDocument: true
},
/* @Prototype */
{
    load: function() {
	this.pending_timers = [];

		var 	ORIGIN = null, 
				FRAME = window.top;

		SMART = new SMART_CLIENT(ORIGIN, FRAME);
		var _this = this;
		SMART.send_ready_message(function(record_info) {	
			Smart.Models.Med.get(function(data) 
    			{
			    _this.meds = data;
			    Smart.Models.Med.findDispenseEvents();
			    _this.initialize_ui();
			});
					     
		    });
    },

    initialize_ui: function() {
	var meds = this.meds;

	// find chronic meds only
	var ds = Smart.Models.Med.dispenses_by_med;
	var chronics = $.grep(meds, function(x) {
		var n = x.nodename;
		return (ds[n] && ds[n].length > 1);
	 });

	$("#chronic-ul").hide()
	    .html(this.view("chronics", {chronics: chronics}))
	    .show("slide", {direction: "right"}, 150);
	
	//	$($("#chronic-div li").get(0)).click();
    },
 
   ".chronic_med click" : function(el) {
       $(".selected").removeClass("selected");
       el.addClass("selected");
       var m = el.model();
       this.view_one_med(m);
   },
   addTimer: function(f, delay) {
       var t = setTimeout(f, delay);
       this.pending_timers.push(t);
   },
   clearTimers: function() {
       for (var i = 0; i < this.pending_timers.length; i++) {
	   window.clearTimeout(this.pending_timers[i]
);
       }
       this.pending_timers = [];

   },
    
    view_one_med: function(m) {
       var a = $("#adherence-view");
       a.html("");
       this.clearTimers();

       var canvas   = $("<canvas class='adherence_canvas' id='adherence_canvas_"+m.nodename+"'></canvas>");

       var fills = Smart.Models.Med.dispenses_by_med[m.nodename];
       var blocks = this.calculate_blocks(fills);

       var d1 = fills[0].start.toString("MMM yyyy");
       var d2 = fills[fills.length-1].start.toString("MMM yyyy");
       var lval = blocks.mprs[0];
       lval = Math.round(lval * 100)+"%";
       var rval = blocks.mprs[blocks.mprs.length-1];
       rval = Math.round(rval * 100)+"%";

       var dates= $("<br clear='all'/><span class='lscore'>"+d1+"<br />"+lval+"</span><span class='rscore'>"+d2+"<br />"+rval+"</span>");
       //       var dates = $("<p class='date_range'>"+d1+"&mdash;" + d2+"</p>");
       var summary = $("<p class='summary'>&nbsp;</p>");
       //       a.append(scores);
       a.append(canvas);

       this.draw_blocks(blocks, canvas);

       var v = parseInt(rval);
       if (v >= 80) v = "Good";
       else if (v >= 50) v = "Fair";
       else v = "Poor";
       var medname = m.properName().split(" ")[0];
	       summary.html(medname+" Adherence:  <b>"+v+"</b>");
	       a.append(dates);
	       a.append(summary);

   },

       draw_blocks: function(blocks, canvas) {
       var height = 80;
       var width = 800;
       var ppd =  pixels_per_day  = width / blocks.goods[blocks.goods.length-1].start * 1.0;

       var reserve = 0;
       //       canvas.hide();
       canvas.attr("width", width);
       canvas.attr("height", height);

       var avd = canvas.parent();
       //              $(".lscore", avd).css("top", (height*(1-blocks.mprs[0]))+"px");
       //      $(".rscore", avd).css("top", (height*(1-blocks.mprs[blocks.mprs.length-1]))+"px");
	      // $(".lscore", avd).css("top", (height*(1))+"px");
       //       $(".rscore", avd).css("top", (height*(1))+"px");

       var xdelta = blocks.starts[blocks.starts.length-2];
       //              $(".rscore", avd).css("right", (width-xdelta*ppd)+"px");

       canvas = canvas[canvas.length - 1];
       
       if (canvas.getContext) {
	   var ctx = canvas.getContext("2d");
	   

	   ctx.fillStyle = "rgba(0, 200, 0, 0.4)";
	   for (var i = 0; i < blocks.goods.length-1; i++) {
	       var g = blocks.goods[i];

	       var m2 = Math.min(blocks.mprs[i+1]);
	       var bar_top = height * (1 - m2*(1-reserve));
	       var bar_height = height - bar_top;

	       ctx.fillRect (g.start * ppd, bar_top, g.duration*ppd, bar_height);
	   }	


	   /*
	   ctx.fillStyle = "rgba(200, 0, 0, .8)";
	   for (var i = 0; i < blocks.bads.length; i++) {
	       var b = blocks.bads[i];
	       ctx.fillRect (b.start*ppd, height*reserve, b.duration*ppd, height*(1-reserve));	   
	   }

	   //	   ctx.fillRect ( width-2, height*reserve, 2, height*(1-reserve));

	   ctx.strokeStyle='rgba(0,0,0,1)';
	   ctx.lineWidth=2;
	   ctx.lineJoin="miter"
	   ctx.beginPath();
	   ctx.moveTo(0, height);
	   for (var i = 0; i < blocks.mprs.length; i++) {
	       var m = blocks.mprs[i];
	       var x= blocks.starts[i+1];
	       ctx.moveTo(x*ppd, height);
	       ctx.lineTo(x*ppd, height -2);
	   }
	   ctx.stroke();


	   ctx.strokeStyle='rgba(0,0,0,1)';
	   ctx.lineWidth=1;
	   ctx.lineJoin="miter"
	   for (var i = 0; i < blocks.mprs.length-1; i++) {
	       var m = Math.min(1,blocks.mprs[i]);
	       var x= blocks.starts[i+1];
	       var x2= blocks.starts[i];
	       var m2 = Math.min(blocks.mprs[i+1]);
	       ctx.beginPath();
	       
	       ctx.lineTo(x*ppd, height * (1 - m2*(1-reserve)));;
	       ctx.lineTo(x2*ppd, height * (1 - m2*(1-reserve)));
	       ctx.stroke();
	   }
	   ctx.font = "20px Graublau Web";
	   ctx.fillStyle = "Black";
	   ctx.fillText("Sample String", 5, 30);
*/


	   ctx.strokeStyle='rgba(0,0,0,1)';
	   ctx.lineWidth=1;
	   ctx.beginPath();
	   var x= blocks.starts[blocks.starts.length-1];
	   ctx.moveTo(0, height);
	   ctx.lineTo(x*ppd, height);
	   ctx.stroke();

       }
       canvas = $(canvas);
       canvas.show();//"slide", {direction: "left"}, 300);

   },

       calculate_blocks: function(fills) {

       var goods = [];
       var bads = [];
       var mprs = [null];
       var starts = [];

       var t_0 = fills[0].start.getTime();
       var l = fills.length;

       var pills_on_hand = 0;
       var total_pills_received = 0;

       for (var i = 0; i < l; i++) {
	   var f = fills[i];
	   var q = parseInt(f.quantity);

	   var start = Math.floor((f.start.getTime() - t_0) / 86400000.0);
	   starts.push(start);


	   
	   if (i > 0){
	       mprs.push(1.0 * total_pills_received / start);

	       var elapsed = start - goods[i-1].start;
	       pills_on_hand -= elapsed;
	       if (pills_on_hand < 0) {
		   var b = {start: start + pills_on_hand, duration: -pills_on_hand};
		   bads.push(b);
		   pills_on_hand = 0;
	       }	       
	   }

	   pills_on_hand += q;
	   total_pills_received += q;

	   var g = {start: start, duration: pills_on_hand};
	   goods.push(g);

       }
       mprs[0] = mprs[1];


       return {starts: starts, goods: goods, bads: bads, mprs: mprs};
       

   }
		

});