var years_apart = function(d1, d2) {
    return (1.0*parse_date(d1).getTime()-parse_date(d2).getTime())/ (1000 * 60 * 60 * 24 * 365);

};
	var parse_date = function(d) {
	    ret = [0,0,0,0,0,0];
	    var arr = d.match(/\d+/g);
	    for (var i = 0; i < arr.length; i++)
		ret[i] = arr[i];
	    ret =  new Date(ret[0], ret[1]-1, ret[2], ret[3], ret[4], ret[5]);
	    return ret;
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

