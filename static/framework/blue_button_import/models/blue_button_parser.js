/**
 * @tag models, home
 * Wraps backend rdf object.
 */
$.Model.extend('BlueButtonImport.Models.BlueButtonParser',
/* @Static */
{
    
},
/* @Prototype */
{	

parse: function(l) {
	for (var i = 0; i < this.handlers.length; i++) {
		if (this.handlers[i].matcher(l)) {
			this.handlers[i].action(l);
			break;
		}
	}
},

	
	
init: function() {
    
    this.handlers = [];
	
	// Parse new medication (patient-entered)    
    this.handlers.push(new handler({
    						parser: bb, 
        					matcher: function(l) {return l.match(/^Drug Name: (.*)/);}, 
        					action: function(l) {
	        					var name = this.matcher(l)[1];
	        					var new_med = {title: name};		        					
	        					this.parser.current = new_med;
	        					this.parser.meds.push(new_med);
        					}
        			}));

	// Parse new medication (from fill DB)        
    this.handlers.push(new handler({
    						parser: bb, 
        					matcher: function(l) {return l.match(/^Medication: (.*)/);}, 
        					action: function(l) {
	        					var name = this.matcher(l)[1];
	        					var new_med = {title: name};		        					
	        					this.parser.current = new_med;
	        					this.parser.meds.push(new_med);
        					}
        			}));

	// Parse med sig
    this.handlers.push(new handler({
    						parser: bb, 
        					matcher: function(l) {return l.match(/^Instructions: (.*)/);}, 
        					action: function(l) {
	        					var sig = this.matcher(l)[1];
	        					this.parser.current.instructions = sig;
        					}
        			}));

	// Parse med sig
    this.handlers.push(new handler({
    						parser: bb, 
        					matcher: function(l) {return l.match(/^Start Date: (.*?)\s*Stop Date: (.*?)\s*$/);}, 
        					action: function(l) {
	        					var ds = this.matcher(l);
	        					var sd = Date.parse(ds[1]);
	        					var ed = Date.parse(ds[2]);
	        					
	        					this.parser.current.start_date = sd;
	        					this.parser.current.end_date = ed;		        					
        					}
        			}));





	// Parse strength
    this.handlers.push(new handler({
    						parser: bb, 
        					matcher: function(l) {return l.match(/^Strength: (.+?)$/);}, 
        					action: function(l) {
        						var s = this.matcher(l)[1];
        						
        						var is_mg = s.match(/(.*)mg$/);
        						
        						if (is_mg) {
        							s = is_mg[1];
        							u = 'mg';
        						}
        						
								this.parser.current.strength = s;
								if (typeof(u) !== 'undefined' && u)
									this.parser.current.strength_units = u;										        						
        					}
        			}));


	// Parse dose
    this.handlers.push(new handler({
    						parser: bb, 
        					matcher: function(l) {return l.match(/^Dose: (.+?)\s*(.*)$/);}, 
        					action: function(l) {
        						var m = this.matcher(l);
        						var d = m[1];
        						var u = m.length ===3 ? m[2] : null;

								this.parser.current.dose = d;
								if (typeof(u) !== 'undefined' && u)
									this.parser.current.dose_units= u;										        						
        					}
        			}));

	// Parse frequency
    this.handlers.push(new handler({
    						parser: bb, 
        					matcher: function(l) {return l.match(/^Frequency: (.*)$/);}, 
        					action: function(l) {
        						var m = this.matcher(l);
        						var f = m[1];
								this.parser.current.frequency = f;
        					}
        			}));

	// Parse problem header (VA)
    this.handlers.push(new handler({
    						parser: bb, 
        					matcher: function(l) {return l.match(/^Health Issues:/);}, 
        					action: function(l) {
        						this.parser.current = "problems";
        					}
        			}));
	// End Problem List
    this.handlers.push(new handler({
    						parser: bb, 
        					matcher: function(l) {
        					 			return this.parser.current ==="problems" && 
        					            l.match(/^\s*$/);},
        					             
        					action: function(l) {
        						this.parser.current = null;
        					}
        			}));

	// Parse problem (VA)
    this.handlers.push(new handler({
    						parser: bb, 
        					matcher: function(l) {return this.parser.current === "problems" && !l.match(/^-*$/);}, 
        					action: function(l) {
        						this.parser.problems.push({title: l});
        					}
        			}));




	// Parse problem (Medicare)
    this.handlers.push(new handler({
    						parser: bb, 
        					matcher: function(l) {return l.match(/^Condition Name: (.*)$/);}, 
        					action: function(l) {
        						var p = {title: l};
        						this.parser.problems.push(p);
        						this.parser.current = p;
        					}
        			}));

	// Parse problem start (Medicare)
    this.handlers.push(new handler({
    						parser: bb, 
        					matcher: function(l) {return l.match(/^Medical Condition Start Date: (.*)$/);}, 
        					action: function(l) {
        						var sd = Date.parse(this.matcher(l)[1]);
        						this.parser.current.onset = sd;
        					}
        			}));


	// Parse problem resolution (Medicare)
    this.handlers.push(new handler({
    						parser: bb, 
        					matcher: function(l) {return l.match(/^Medical Condition End Date: (.*)$/);}, 
        					action: function(l) {
        						var ed = Date.parse(this.matcher(l)[1]);
        						this.parser.current.resolution = ed;
        					}
        			}));



    this.meds = [];
    this.problems = [];
    this.current = null;
    
	
}
});