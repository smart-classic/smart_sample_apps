var years_apart = function(d1, d2) {
 console.log("NEWD");
 console.log(parse_date(d1));
 console.log(parse_date(d2).getTime());

 return (parse_date(d1).getTime()-parse_date(d2).getTime())/ (1000 * 60 * 60 * 24 * 365)

};
	var parse_date = function(d) {
            var dp = new Date(d);
            if (isNaN(dp)) { // IE Date constructor doesn't parse ISO-8601 -JCM
               d = d.split("-");
               var dp = new Date();
               dp.setFullYear(d[0], d[1]-1, d[2]);
            }
	    return dp;
	};

	  
	var StateCheck = function(states) {
          this.responses = {};
	  this.callback = function(){};

	  this.onDone = function(f) {
	    this.callback = f;
            return this;
	  };

	  this.done = function(newstate) {
	    this.responses[newstate] = true;
	    for (var i=0; i < states.length; i++) {
	      if (this.responses[states[i]] !== true) 
	        return;
	    }
            this.callback();
	  };
          return this;
	};

