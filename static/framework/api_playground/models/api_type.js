$.Model.extend('ApiType',
/* @Static */
{
	init: function() {
		this.types = {};	
		this.url_param_reg = /\{.*?\}/g;
		
		this.interpolations = {lists: {}};
		console.log("initting apitype");
	},
	 
	addInterpolationValue: function(field, value) {
		if (this.interpolations.lists[field] === undefined)
			this.interpolations.lists[field] = [];
		
		if ($.inArray(value, this.interpolations.lists[field]) === -1)
			this.interpolations.lists[field].push(value);
		
	},
	interpolationVars: function(url) {
		var fields = url.match(ApiType.url_param_reg);
		return fields;	
	},

	interpolatedPath: function(url) {	
		var url = url.replace("http://smartplatforms.org", "");
		var fields = this.interpolationVars(url);
		
		for (var i = 0; i < fields.length; i++) {
			var f = fields[i];
			var fsans = f.substring(1, f.length-1);
			
			url = url.replace(f, this.interpolations[fsans]);
		}
		return url;
	},
	
	get_or_create: function(t) {
		var searchClass = t.cls.value;
		
		var ret = this.types[searchClass];

		if (ret === undefined) {
			ret = new ApiType({type: searchClass });
			ret.example = t.e.value;
			ret.name = t.n.value;
			console.log("creating type " + ret.example);	
			this.types[searchClass] = ret;
		}
		return ret;
	},
	pathRegex: function(path) {
		var b = path;
		var fields = b.match(ApiType.url_param_reg);
		
		var b = b.replace("http://smartplatforms.org", "");
		for (var i = 0; i < fields.length; i++) {
			var f = fields[i];
			var fsans = f.substring(1, f.length-1);
			
			b = b.replace(fields[i], "([^/]*)");
		}
		
		var re = RegExp(b);
		var ret = function(s) {
			var matches = {};
			var m = s.match(re);
			if (m === null) return matches;
			if (m.length != fields.length+1){ 
				throw "Expected match size = fields size+1"  +
							 m.join(", ")+ " vs. " + fields.join(", ");
			}
			for (var i = 0; i < fields.length; i++) {
				var f = fields[i];
				var fsans = f.substring(1, f.length-1);
				matches[fsans] = m[i+1];
			}
			
			return matches;
		};
		
		console.log("regex " + b);
		return ret;		
	},	
	
},
/* @Prototype */
{	

  init: function()
  {
	this.calls = [];
  },

   fetchParameters: function() {
   		
   		var c = this.fetchParametersCall();
   		var base_regexes = [];
   		
		$.each(ApiCall.calls, function(path, call) {
			if ($.inArray("base_path", call.targets) === -1) return;
			base_regexes.push(ApiType.pathRegex(call.path));	
		});
		
   		var args = c.buildCallArgs("GET", "", function(contentType, data) {
   			var rdf = SMART.process_rdf(contentType, data);
			var typed_entities = rdf.where("?s rdf:type ?p");
			console.log("Typed entities available: " + typed_entities.length);
			
			$.each(typed_entities, function() {
				var entity_url = ""+this.s.value;

				$.each(base_regexes, function() {
					var matched = this(entity_url);
					$.each(matched, function(fieldname, value) {
						ApiType.addInterpolationValue(fieldname, value);
					});
				
				});

			});
   		});
   		
   		SMART.api_call(args[0], args[1]);
   },

   fetchParametersCall: function() {
		var c = $.grep(this.calls, 
					function(c) {return ($.inArray("record_items", c.targets) >=0);});
		
		var parent_candidates = []
		$.each(ApiCall.calls, function(i, possible_parent) {
			if (possible_parent.path.length >= c[0].path.length) return;			
			if (c[0].path.match(possible_parent.path)) c[0] = possible_parent;  
		});
		
		return c[0];
   },

   addCall: function(c) {
		if ($.inArray(c, this.calls) === -1) { 		
			this.calls.push(c);
			c.type = this;
		} 
		return;
	},

   parentBasePath: function() {
		var c = $.grep(this.calls, 
					function(c) {return ($.inArray("base_path", c.targets) >=0);});
		
		var parent_candidates = []
		$.each(ApiCall.calls, function(i, possible_parent) {
			if (possible_parent.path.length >= c[0].path.length) return;			
			if (c[0].path.match(possible_parent.path)) c[0] = possible_parent;  
		});
		
		return c[0].path;
   },

	
	basePath: function(){
		var ret = $.grep(this.calls, 
					function(c) {return ($.inArray("base_path", c.targets) >=0);});
				
		if (ret.length == 0) return "nobasepath in " + this.calls.length;
		return ret[0].path;
	},
	
	callsForDisplay: function() {
		var ret = {};
		ret["many"] = [];
		ret["one by ID"] = [];
		ret["one by external key"] = [];
		
		for (var i=0; i < this.calls.length; i++) {
			var c = this.calls[i];
			if ($.inArray("record_item", c.targets) !== -1 &&
				!c.path.match(/external_id/))
			{
				ret["one by ID"].push(c);
			}
			else if ($.inArray("record_item", c.targets) !== -1 &&
				c.path.match(/external_id/))
			{
				ret["one by external key"].push(c);
			}
			else if ($.inArray("record_items", c.targets) !== -1) 
			{
				ret["many"].push(c);
			}
		} 
		
		return ret;
	}

});

$.Model.extend('ApiCall',
/* @Static */
{

	init: function() {
		this.calls = {};
		this.payload_methods = ['PUT', 'POST'];
		},
	
	get_or_create: function(t) {
		var searchPath = t.p.value;
		
		var ret = this.calls[searchPath];
		if (ret === undefined) {
			ret = new ApiCall({path: searchPath});
			this.calls[searchPath] = ret;
		}

		ret.addMethod(t.m.value);
		ret.addTarget(t.t.value);
		
		return ret;
	}

},
/* @Prototype */
{	
	init: function()
	{
		this.methods = [];
		this.targets = [];
    },
	
	addMethod: function(m) {
		if ($.inArray(m, this.methods) === -1) {
			this.methods.push(m);
			this.methods = this.methods.sort();	
		}
		return;
	},
	addTarget: function(t) {
		if ($.inArray(t, this.targets) === -1 )
			this.targets.push(t);
		return;
	},
	
	contentTypeForMethod: function(method) {
		if ($.inArray(method, this.Class.payload_methods) !== -1) {
			return "application/rdf+xml";
		}
		return "application/x-www-form-urlencoded"
	},
	
	callAPI: function(method, data, callback) {
		var args = this.buildCallArgs(method, data, callback);
		SMART.api_call(args[0], args[1]);
	},
	
	buildCallArgs: function(method, data, callback) {
		var call_args = [{
			method: method, 
			url: ApiType.interpolatedPath(this.path), 
			contentType: this.contentTypeForMethod(method), 
			data: data || {}
		}, callback];
	
		return call_args;
	}
});