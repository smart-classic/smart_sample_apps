/**
 * @tag controllers, home
 */
jQuery.Controller.extend('MedBatchAdd.Controllers.OneMedController',
/* @Static */
{
},
/* @Prototype */
{
  init: function(elt) {
		this.element = $(elt);
		var med = this.element.data("models").med;
		this.med = med;
		this.element.html(this.view('one_med', {med: med}));
		
	},

	"INPUT[type='checkbox'] click": function(elt) {
		this.save_state(elt.is(":checked"));
	},

	check: function() {
		this.save_state(true);
	},
	uncheck: function() {
		this.save_state(false);	
	},
	save_state: function(checked) {
		var cb = $("INPUT[type='checkbox']", this.element);
		cb.attr('checked', checked);
		this.med.checked = checked;
	},
	update_med: function() {
		this.med.strength = 		$('.strength', this.element).val();
		this.med.strength_units  =  $('.strengthUnits', this.element).val();
		this.med.instructions =     $('.instructions', this.element).val();		
	}
	
	});