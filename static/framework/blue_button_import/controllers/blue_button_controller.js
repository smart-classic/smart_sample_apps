/**
 * @tag controllers, home
 */
jQuery.Controller.extend('BlueButtonImport.Controllers.BlueButtonController',
/* @Static */
{
	onDocument: true

},
/* @Prototype */
{
  init: function() {
	
	var 	ORIGIN = null, 
	FRAME = window.top;

	SMART = new SMART_CLIENT(ORIGIN, FRAME);
	
	SMART.send_ready_message(function(record_info) {});
	

	
    this.handlers = [];
	
	// Parse new medication (patient-entered)    
    this.handlers.push(new BlueButtonImport.Models.Handler({
    						parser: this, 
        					matcher: function(l) {return l.match(/^Drug Name: (.*)/);}, 
        					action: function(l) {
	        					var name = this.matcher(l)[1];
	        					
	        					var new_med = new SmartMedDisplay.Models.Med(null);
	        					new_med.drug = name;
	        					this.parser.current = new_med;
	        					this.parser.meds.push(new_med);
        					}
        			}));

	// Parse new medication (from fill DB)        
    this.handlers.push(new BlueButtonImport.Models.Handler({
    						parser: this, 
        					matcher: function(l) {return l.match(/^Medication: (.*)/);}, 
        					action: function(l) {
	        					var name = this.matcher(l)[1];
	        					var new_med = new SmartMedDisplay.Models.Med(null);
	        					new_med.drug = name;
	        					this.parser.current = new_med;
	        					this.parser.meds.push(new_med);
        					}
        			}));

	// Parse med sig
    this.handlers.push(new BlueButtonImport.Models.Handler({
    						parser: this, 
        					matcher: function(l) {return l.match(/^Instructions: (.*)/);}, 
        					action: function(l) {
	        					var sig = this.matcher(l)[1];
	        					this.parser.current.notes = sig;
        					}
        			}));

	// Parse med sig
    this.handlers.push(new BlueButtonImport.Models.Handler({
    						parser: this, 
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
    this.handlers.push(new BlueButtonImport.Models.Handler({
    						parser: this, 
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
    this.handlers.push(new BlueButtonImport.Models.Handler({
    						parser: this, 
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
    this.handlers.push(new BlueButtonImport.Models.Handler({
    						parser: this, 
        					matcher: function(l) {return l.match(/^Frequency: (.*)$/);}, 
        					action: function(l) {
        						var m = this.matcher(l);
        						var f = m[1];
								this.parser.current.frequency = f;
        					}
        			}));

	// Parse problem header (VA)
    this.handlers.push(new BlueButtonImport.Models.Handler({
    						parser: this, 
        					matcher: function(l) {return l.match(/^Health Issues:/);}, 
        					action: function(l) {
        						this.parser.current = "problems";
        					}
        			}));
	// End Problem List
    this.handlers.push(new BlueButtonImport.Models.Handler({
    						parser: this, 
        					matcher: function(l) {
        					 			return this.parser.current ==="problems" && 
        					            l.match(/^\s*$/);},
        					             
        					action: function(l) {
        						this.parser.current = null;
        					}
        			}));

	// Parse problem (VA)
    this.handlers.push(new BlueButtonImport.Models.Handler({
    						parser: this, 
        					matcher: function(l) {return this.parser.current === "problems" && !l.match(/^-*$/);}, 
        					action: function(l) {
        						var p = new SmartMedDisplay.Models.Problem(null);
        						p.title = l;
        						this.parser.problems.push(p);
        					}
        			}));

	// Parse problem (Medicare)
    this.handlers.push(new BlueButtonImport.Models.Handler({
    						parser: this, 
        					matcher: function(l) {return l.match(/^Condition Name: (.*)$/);}, 
        					action: function(l) {
        						var p = new SmartMedDisplay.Models.Problem(null);
        						p.title = this.matcher(l)[1];
        						this.parser.problems.push(p);
        						this.parser.current = p;
        					}
        			}));

	// Parse problem start (Medicare)
    this.handlers.push(new BlueButtonImport.Models.Handler({
    						parser: this, 
        					matcher: function(l) {return l.match(/^Medical Condition Start Date: (.*)$/);}, 
        					action: function(l) {
        						var sd = Date.parse(this.matcher(l)[1]);
        						if (sd !== null)	
        							this.parser.current.onset = sd.toISOString();
        					}
        			}));


	// Parse problem resolution (Medicare)
    this.handlers.push(new BlueButtonImport.Models.Handler({
    						parser: this, 
        					matcher: function(l) {return l.match(/^Medical Condition End Date: (.*)$/);}, 
        					action: function(l) {
        						var ed = Date.parse(this.matcher(l)[1]);
        						if (ed !== null)
        							this.parser.current.resolution = ed.toISOString();;
        					}
        			}));
	
	$('#bb_upload').change(function() {
		$('#bb_file_form').submit();
	}); 

    $('#bb_file_form').ajaxForm({
    	dataType: 'text',
        beforeSubmit: function(a,f,o) {
          $('#upload_status').html('Uploading...');
        },
        
        success: this.callback(function(data) {
          $('#upload_status').html('');
    	  $('#bb_paste').val(data);
    	  this.parse();
    	})
    }); 
    
    $('#bb_parse_form').submit(this.callback(function() {this.parse(); return false;}));
},

parse: function() {
    this.meds = [];
    this.problems = [];
    this.current = null;

	var data = $('#bb_paste').val();
    var lines = data.split('\n');

    for (var i = 0; i < lines.length; i++) {
    	this.parseLine(lines[i]);
    }
    
    this.render();
    this.saveMeds();
    this.saveProblems();
},

saveMeds: function() {
    for (var i = 0; i < this.meds.length; i++) {
    	var xml = this.meds[i].toRDFXML();
		var dname = this.meds[i].drug;

		(function(xml, dname) {
    	SmartMedDisplay.Models.Med.post(xml, function(){
    	    var h = $('#interact').html();
    		h  = h +  "Added Med: " + dname+"<br>\n";
    		$('#interact').html(h);
    		});
		}(xml, dname));
    }
},

saveProblems: function() {
    for (var i = 0; i < this.problems.length; i++) {
    	(function(problem) {
    	SmartMedDisplay.Models.Problem.post(problem, function(){
        	var h = $('#interact').html();
    		h  = h +  "Added Problem: " + problem.title+"<br>\n";
    		$('#interact').html(h);
    		});
    	}(this.problems[i]));
    }
},

parseLine: function(l) {
	for (var i = 0; i < this.handlers.length; i++) {
		if (this.handlers[i].matcher(l)) {
			this.handlers[i].action(l);
			break;
		}
	}
},

render: function() {        
 
        $('#interact').html('Adding '+ this.meds.length + ' meds and '+this.problems.length+' problems... \n<br>');
}

});