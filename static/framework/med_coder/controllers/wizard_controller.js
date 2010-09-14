/**
 * @tag controllers, home
 */
jQuery.Controller.extend('MedCoder.Controllers.WizardController',
/* @Static */
{

},
/* @Prototype */
{

init: function(el, meds) {

	this.meds = SmartMedDisplay.Models.Med.from_rdf_array(meds);

	this.current = 0;
	this.uncoded  = $.grep(this.meds, function(med, i) {
		var ret = (typeof(med.cui) === 'undefined' 
			|| ! med.cui 
			|| med.cui._string === 'http://link.informatics.stonybrook.edu/rxnorm/RXCUI/00000');
		return ret;
	});
	

	
	this.choices = [];
	this.request_queue = [];
	
	var _this = this;
	for (var i = 0; i < this.uncoded.length; i++) {
		this.request_queue.push({id: i, fetch: (function(i, one_med) {
		return function() {
		SMART.webhook('fuzzy_match_rxnorm', {q: one_med.drug}, 
				function(rdf) {
					var choices = rdf.where("?q <http://smartplatforms.org/fuzzy_match_rxnorm> ?m ")
									 .where("?m <http://purl.org/dc/terms/title> ?t ")
									 .where("?m <http://link.informatics.stonybrook.edu/rxnorm/RXCUI> ?cui ");
					
					_this.choices[i] = choices;
					_this.received_choices(i);
				}
			)};}(i, _this.uncoded[i]))}
		);
	
	}
	
	if (this.request_queue.length === 0)
		return;

	// Spawn up to fetch "threads"
	var MAX_FETCH_THREADS = 2;
	for (var i = 0; i < Math.min(MAX_FETCH_THREADS, 
								 this.request_queue.length); i++)
		this.request_queue.shift().fetch();

	
	this.update_view();
},
received_choices: function(i) {
	if (this.current === i) {
		this.update_choices_view();
	}
	
	if (this.request_queue.length === 0)
		return;
	
	this.request_queue.shift().fetch();	
	},
	
update_choices_view: function() {
	$('#wizard-content').html(
			this.view('one_med', {title: this.uncoded[this.current].drug, choices: this.choices[this.current]})
	);
},

".code_choice click" : function(el) {
	var choice = el.attr("name");

	if (choice !== null && choice !== "null") {
		var m = this.uncoded[this.current];
		m.cui = choice;
	}

	$("#next").click();	
},

update_view: function() {
	$('#wizard').flash('255,255,255', 200);
	$('#uncertain_count').html(this.uncoded.length);
	$('#total_count').html(this.meds.length);
	
	if (this.current == this.uncoded.length) {
		return this.finish_screen();
	}
	
	if (this.current == this.uncoded.length -1) {
		$('#next').html("Finish");
	}
	else {
		$('#next').show();
	}
	
	if (this.current == 0 ){
		$('#prev').hide();
	}
	else {
		$('#prev').show();
	}
	
	$('#current').html("Med #"+(this.current+1)+" of "+ this.uncoded.length);
	$('#wizard-content').html("...");

	if (typeof(this.choices[this.current]) !== 'undefined')
	{
		this.update_choices_view();
	}
	else {
		var pos = null;

		for (var i = 0; i < this.request_queue.length; i++) {
			if (this.request_queue[i].id === this.current) {
				pos = i;
				break;
			}
		}
		if (pos === null)
			return;
			
		var tmp = this.request_queue[0];
		this.request_queue[0] = this.request_queue[pos];
		this.request_queue[pos] = tmp;
	}		
},

"#next click" : function() {
	if (this.current >= this.choices.length) return;
	this.current += 1;
	this.update_view();
},

"#prev click" : function() {
	if (this.current <= 0) return;
	this.current -= 1;
	this.update_view();
},

finish_screen: function() {	
	SMART.end_activity(
			SmartMedDisplay.Models.Med.to_rdf_array(this.meds), 
			function(){	
					$('#wizard').html(this.view('finished'));
				});
}

});

jQuery.fn.flash = function( color, duration )
{
    var fgcurrent = this.css( 'color' );
    var bgcurrent = this.css( 'background' );

    this.animate( { color: 'rgb(' + color + ')', background: 'rgb(' + color + ')'}, duration / 2 );
    this.animate( { color: fgcurrent, background: bgcurrent}, duration / 2 );
};