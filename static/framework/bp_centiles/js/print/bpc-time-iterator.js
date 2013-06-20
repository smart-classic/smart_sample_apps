(function(NS, $) {

	function TimeIterator(startTime, endTime, ceil, timeStep) 
	{
		var d     = new XDate(startTime),
			inst  = this,
			steps = [
				"Millisecond", 
				"Second", 
				"Minute",
				"Hour",
				"Day",
				"Week",
				"Month",
				"Year"
			],
			tresholds = {
				"Millisecond" : 1, 
				"Second"      : 2, 
				"Minute"      : 2,
				"Hour"        : 23,
				"Day"         : 7,
				"Week"        : 4,
				"Month"       : 12,
				"Year"        : 2
			},
			step;
		
		this.startTime = startTime;
		this.endTime   = endTime;
		
		// Add some methods like hasPrevDay, hasNextDay, prevDay, nextDay...
		$.each(steps, function(i, name) {
			inst["hasNext" + name] = function() {
				return d["diff" + name + "s"](this.endTime) >= 1;
			};
			inst["hasPrev" + name] = function() {
				return d["diff" + name + "s"](this.endTime) <= -1;
			};
			inst["next" + name] = function() {
				return d["add" + name + "s"](1);
			};
			inst["prev" + name] = function() {
				return d["add" + name + "s"](-1);
			};
		});
		
		this.getTimeStep = function() {
			if (!step) {
				step = "Millisecond";
				
				var d1 = new XDate(this.startTime),
					d2 = new XDate(this.endTime  );
				
				$.each(steps, function(i, name) {
					//console.log(step, " : ", d1["diff" + name + "s"](d2), " vs ", tresholds[name]);
					if (d1["diff" + name + "s"](d2) > 1) {
						step = name;
					}
				});
			}
			return step;
		};
		
		this.setTimeStep = function(s) {
			for ( var i = steps.length - 1; i >= 0; i-- ) {
				if (steps[i] == s) {
					step = s;
					if (ceil) {
						this.ceil();
					}
					break;
				}
			}
			return this;
		};
		
		this.current = function() {
			return {
				date : d,
				pos  : (d.getTime() - this.startTime) / (this.endTime - this.startTime)
			};
		};
		
		this.hasNext = function() {
			return this["hasNext" + step]();
		};
		
		this.hasPrev = function() {
			return this["hasPrev" + step]();
		};
		
		this.next = function() {
			return this["next" + step]();
		};
		
		this.prev = function() {
			return this["prev" + step]();
		};
		
		this.rewind = function() {
			return d.setTime(this.startTime);
		};
		
		this.ceil = function() {
			
			// Note: start with dates that are reset to the initial times
			var d1 = new XDate(startTime);
			var d2 = new XDate(endTime  );
			
			switch ( this.getTimeStep() ) {
				case "Year":
					d1.setMonth(0 , true).setDate(1 ).setHours(0 ).setMinutes(0 ).setSeconds(0 ).setMilliseconds(0);
					d2.setMonth(11, true).setDate(31).setHours(23).setMinutes(59).setSeconds(59).setMilliseconds(1000);
					break;
				case "Month":
					d1.setDate(1       ).setHours(0 ).setMinutes(0 ).setSeconds(0 ).setMilliseconds(0);
					d2.setDate(31, true).setHours(23).setMinutes(59).setSeconds(59).setMilliseconds(1000);
					break;
				case "Week":
					d1.setWeek(d1.getWeek()).setMilliseconds(0);
					d2.setWeek(d2.getWeek() + 1).setMilliseconds(0);
					break;
				case "Day":
					d1.setHours(0 ).setMinutes(0 ).setSeconds(0 ).setMilliseconds(0);
					d2.setHours(23).setMinutes(59).setSeconds(59).setMilliseconds(1000);
					break;
				case "Hour":
					d1.setMinutes(0 ).setSeconds(0 ).setMilliseconds(0);
					d2.setMinutes(59).setSeconds(59).setMilliseconds(1000);
					break;
				case "Minute":
					d1.setSeconds(0 ).setMilliseconds(0);
					d2.setSeconds(59).setMilliseconds(1000);
					break;
				case "Second":
				default:
					d1.setMilliseconds(0);
					d2.setMilliseconds(1000);
					break;
			}
			
			this.startTime = d1.getTime();
			this.endTime   = d2.getTime();
			this.rewind();
			
			console.log(d1.toString() + "\n" + d2.toString());
		};
		
		this.getTimeStep();
		
		if (ceil) {
			this.ceil();
		}
		
		if (timeStep) {
			this.setTimeStep(timeStep);
		}
	}
	
	NS.TimeIterator = TimeIterator;
	
})(window.BPC || {}, jQuery);
