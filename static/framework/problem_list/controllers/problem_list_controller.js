/**
 * @tag controllers, home
 */
jQuery.Controller.extend('ProblemList.Controllers.ProblemListController',
/* @Static */
{
},
/* @Prototype */
{
	init: function() {
		var v = this.view('init', {} );
		this.element.html(v);
		var _this = this;
		var form = jQuery('#AddProblemForm');

		jQuery('#ProblemEntry').autocomplete(
				{source: SMART.AUTOCOMPLETE_RESOLVER("umls-snomed"),
				 focus: function(ev, ui) {return false;},
				 select: function(ev,ui) {
					 form.data("problem_code", ui.item.value); 
				 	 jQuery('#ProblemEntry').val(ui.item.label);
				 	 return false;
				 }});

		
		jQuery('#OnsetEntry').datepicker();
		jQuery('#ResolutionEntry').datepicker();
		form.submit(function() {
			var p = new Smart.Models.Problem();
			p.concept =  "http://www.ihtsdo.org/snomed-ct/concepts/"+form.data("problem_code");
			p.title =  jQuery('#ProblemEntry').val();
			p.onset = jQuery('#OnsetEntry').val();
			p.resolution = jQuery('#ResolutionEntry').val();
			p.notes = jQuery('#NotesEntry').val();			
			Smart.Models.Problem.post(p, _this.callback(_this.display_problems));
			
			return false;
		});
		
		this.display_problems();
		
	},
	".delete_problem click": function(el) {
		var _this = this;
		Smart.Models.Problem.del(
				el.closest(".problem").model().rdf.value.path,
				_this.callback(_this.display_problems));
	},
	display_problems: function() {
		
		jQuery('#AddProblemForm').val("");
		jQuery('#ProblemEntry').val("");
		jQuery('#OnsetEntry').val("");
		jQuery('#ResolutionEntry').val("");
		jQuery('#NotesEntry').val("");

		jQuery('#ProblemEntry').focus();	
		
		Smart.Models.Problem.get(
			this.callback(
				function(problems) {
					this.problems = problems;
					var v = this.view('problems', {problems: problems});
					this.element.html(v);				
				}	
			)
		);
	}

		
});
