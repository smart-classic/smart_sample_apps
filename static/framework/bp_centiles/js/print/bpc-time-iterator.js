(function(NS, $, undefined) {
	
	/**
	 * Class TimeIterator.
	 * Provides some useful methods for iterating over time intervals.
	 * @param {Number|Date|String} startTime Anything that the XDate can use to
	 *                                       construct itdelf from.
	 * @param {Number|Date|String} endTime Anything that the XDate can use to
	 *                                     construct itdelf from.
	 * @param {Boolean} ceil (optional) Wether to ceil the interval boundaries.
	 *                                  Defaults to false.
	 * @param {String} timeStep (optional) The time step to use. Defaults to 
	 *                                     auto-detected step.
	 * @constructor
	 */
	function TimeIterator(startTime, endTime, ceil, timeStep) 
	{
		var d     = new XDate(startTime),
			inst  = this,
			_startTime = new XDate(startTime).getTime(),
			_endTime   = new XDate(endTime).getTime(),
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
			step;
		
		this.startTime = _startTime;
		this.endTime   = _endTime;
		
		// Add some (32) methods like hasPrevDay, hasNextDay, prevDay, nextDay...
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
		
		/**
		 * Returns the currently used time step. Note that the "step" property 
		 * is cached internally. It can be set while creating the instance (if 
		 * the fourth argument of the constructor is used), or it might still be
		 * empty. If it is empty this function will compute and store it.
		 * In other words, use this method to get whatever is being used as 
		 * "step" or use the "detectTimeStep" method to always compute the best 
		 * fitting step...
		 */
		this.getTimeStep = function() 
		{
			if (!step) {
				step = this.detectTimeStep();
			}
			return step;
		};
		
		/**
		 * Auto-detects the time step. The biggest step that can fit within the 
		 * current range is returned.
		 * @returns {String} The step
		 */
		this.detectTimeStep = function()
		{
			var out = "Millisecond",
				d1  = new XDate(this.startTime),
				d2  = new XDate(this.endTime  );
			$.each(steps, function(i, name) {
				if (d1["diff" + name + "s"](d2) > 1) {
					out = name;
				}
			});
			return out;
		};
		
		/**
		 * Sets the "time step".
		 * @param {String} s The time step to apply. Must be a valid step, i.e.
		 *                   one of the values contained at the "steps" array.
		 * @returns {TimeIterator} Returns this instance
		 */ 
		this.setTimeStep = function(s) 
		{
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
		
		/**
		 * Returns a descriptor object for the current position having the 
		 * following properties:
		 * 
		 *     "date" - The XDate object for the time at the current position 
		 *     "pos"  - A float number (0 to 1) to show the position within the 
		 *              entire range.
		 */
		this.current = function() 
		{
			return {
				date : d,
				pos  : (d.getTime() - this.startTime) / 
						(this.endTime - this.startTime)
			};
		};
		
		/**
		 * Checks if one step next is available
		 */
		this.hasNext = function() 
		{
			return this["hasNext" + step]();
		};
		
		/**
		 * Checks if one step back is available
		 */
		this.hasPrev = function() 
		{
			return this["hasPrev" + step]();
		};
		
		/**
		 * Moves one step forward
		 */
		this.next = function() 
		{
			return this["next" + step]();
		};
		
		/**
		 * Moves one step backward
		 */
		this.prev = function() 
		{
			return this["prev" + step]();
		};
		
		/**
		 * Goes to this.startTime
		 */
		this.rewind = function() 
		{
			return d.setTime(this.startTime);
		};
		
		/**
		 * Ceils the time interval so that if for example the step is "Day", 
		 * then the "startTime" is set to the start of it's day and the 
		 * "endTime" is set to the end of it's day.
		 */
		this.ceil = function() 
		{
			// Note: start with dates that are reset to the initial times by 
			// using the local vars created from the constructor arguments here
			var d1 = new XDate(_startTime);
			var d2 = new XDate(_endTime  );
			
			switch ( this.getTimeStep() ) {
				case "Year":
					d1  .setMonth(0, true)
						.setDate(1)
						.setHours(0)
						.setMinutes(0)
						.setSeconds(0)
						.setMilliseconds(0);
					d2  .setMonth(11, true)
						.setDate(31)
						.setHours(23)
						.setMinutes(59)
						.setSeconds(59)
						.setMilliseconds(1000);
					break;
					
				case "Month":
					d1  .setDate(1)
						.setHours(0)
						.setMinutes(0)
						.setSeconds(0)
						.setMilliseconds(0);
					d2  .setDate(31, true)
						.setHours(23)
						.setMinutes(59)
						.setSeconds(59)
						.setMilliseconds(1000);
					break;
					
				case "Week":
					d1.setWeek(d1.getWeek()).setMilliseconds(0);
					d2.setWeek(d2.getWeek() + 1).setMilliseconds(0);
					break;
					
				case "Day":
					d1  .setHours(0 )
						.setMinutes(0)
						.setSeconds(0)
						.setMilliseconds(0);
					d2  .setHours(23)
						.setMinutes(59)
						.setSeconds(59)
						.setMilliseconds(1000);
					break;
					
				case "Hour":
					d1  .setMinutes(0)
						.setSeconds(0)
						.setMilliseconds(0);
					d2  .setMinutes(59)
						.setSeconds(59)
						.setMilliseconds(1000);
					break;
					
				case "Minute":
					d1  .setSeconds(0)
						.setMilliseconds(0);
					d2  .setSeconds(59)
						.setMilliseconds(1000);
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
			//console.log(d1.toString() + "\n" + d2.toString());
		};
		
		// Initialization:
		this.getTimeStep();
		
		if (ceil) {
			this.ceil();
		}
		
		if (timeStep) {
			this.setTimeStep(timeStep);
		}
	}
	
	NS.TimeIterator = TimeIterator;
	
})(BPC, jQuery);
