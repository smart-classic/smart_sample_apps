$.Model.extend('ApiType',
/* @Static */
{
	
	init: function() {
		this.types = [];	
		this.url_param_reg = /\{.*?\}/g;
		
		this.interpolations = {lists: {}};
		//console.log("initting apitype");
	},
	
	find_type: function(uri) {
	//		console.log("finding type " + uri)
		var r = $.grep(this.types, function(t){return (t.type == uri);});
		return r[0];
	},

	find_all_types_and_calls: function() {
		SMART.get_ontology().then(function(r) {
            var ont = r.graph;
			this.ontology = ont;
			
			// Get all types
			var types = ont.where("?cls rdf:type owl:Class")			
			               .where("?cls rdfs:label ?class_name")			
		   		       .optional("?cls api:example ?class_example");
			
			for (var i = 0; i < types.length; i++) {
				ApiType.create(types[i]);
			}
			
			// Get all calls
			var calls = ont.where("?call rdf:type api:Call")				
			   .where("?call api:path ?call_path")
			   .where("?call api:target ?call_target")
			   .where("?call api:cardinality ?call_cardinality")
			   .where("?call api:category ?call_category")
			   .where("?call api:httpMethod ?call_method")
			   .optional("?call api:example ?call_example");
			
			for (var i = 0; i < calls.length; i++) {
			    if (calls[i].call_category.value.match(/^record/)) {
                    var params = [];
                    var parameters = ont.where(calls[i].call.toString() + " rdf:type api:Call")
                                     .where(calls[i].call.toString() + " api:hasParameter ?p")
                                     .where("?p api:clientParameterName ?call_parameter");
                    for (var j = 0; j < parameters.length; j++) {
                        params.push (parameters[j].call_parameter.value.toString());
                    }
                    var filters = ont.where(calls[i].call.toString() + " rdf:type api:Call")
                                     .where(calls[i].call.toString() + " api:hasFilter ?f")
                                     .where("?f api:clientParameterName ?call_parameter");
                    for (var j = 0; j < filters.length; j++) {
                        params.push (filters[j].call_parameter.value.toString());
                    }
                    ApiCall.create(calls[i], params);
                }
			}

			ApiCallGroup.make_groups();
		    OpenAjax.hub.publish("ontology_parsed");
		});
	},
	
	addInterpolationValue: function(field, value) {
        //console.log ("adding interpolation " + field + " " + value);
		if (this.interpolations.lists[field] === undefined)
			this.interpolations.lists[field] = [];
		
		if ($.inArray(value, this.interpolations.lists[field]) === -1)
			this.interpolations.lists[field].push(value);
		
	},
	interpolationVars: function(url) {
		var fields = url.match(ApiType.url_param_reg);
		if (fields === null)
		    return [];

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
    
    paramsArray: function(params) {	
		var res = {},
            val;
		
		for (var i = 0; i < params.length; i++) {
			val = this.interpolations[params[i]];
            if (val && val.length > 0) {
                res[params[i]] = val;
            }
		}
		return res;
	},
	
	create: function(t) {	
		var ret = new ApiType({
			type: t.cls.value._string,
			name: t.class_name.value,
			example: t.class_example && t.class_example.value  || ""
		});
		this.types.push(ret);
		return ret;
	},

	pathRegex: function(path) {
		var b = path;
		var fields = b.match(ApiType.url_param_reg);
  	        if (fields == null) fields = [];

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
		
		//console.log("regex " + b);
		return ret;		
	}	
	
},
/* @Prototype */
{	

  init: function()
  {
	this.calls = [];
  },

  fetchParameters: function() {
    try {
   		var c = this.fetchParametersCall();
   		var base_regexes = [];
   		
		$.each(ApiCall.calls, function(path, call) {
			if (call.method == "GET")
				base_regexes.push(ApiType.pathRegex(call.path));	
		});
		
		var args = c.buildCallArgs("", function(r) {
        
            if (r.contentType === "application/rdf+xml") {
                var rdf = SMART.process_rdf(r.contentType, r.body);
                var typed_entities = rdf.where("?s rdf:type ?p");
                //console.log("Typed entities available: " + typed_entities.length);
                
                $.each(typed_entities, function() {
                    var entity_url = ""+this.s.value;
                    $.each(base_regexes, function() {
                        var matched = this(entity_url);
                        $.each(matched, function(fieldname, value) {
                            ApiType.addInterpolationValue(fieldname, value);
                        });
                    
                    });

                });
            }
            ApiType.addInterpolationValue("user_id",SMART.user.id);
            ApiType.addInterpolationValue("smart_app_id",SMART.manifest.id);

   		});
   		
   		SMART.api_call(args[0], args[1]);
    } catch(err) {
        // just ignore it
    }
   },

   fetchParametersCall: function() {	   
	   var uri = this.type;
  	   var c = $.grep(ApiCall.calls, function(c) {return c.method=="GET" && c.target === uri && c.category==="record" &&
                      c.cardinality=="multiple";})[0];
       return c;
   }
});

$.Model.extend('ApiCall',
/* @Static */
{

	init: function() {
		this.calls = [];
		this.payload_methods = ['PUT', 'POST'];
		},
	
	create: function(t, params) {
    
        if (t.call_cardinality.value === "multiple") {
            params.push ("limit");
            //params.push ("offset");
        }
		
		ret = new ApiCall({path: t.call_path.value,
						   target: t.call_target.value._string,
                  				   example: t.call_example?t.call_example.value : undefined,
						   category: t.call_category.value,
						   cardinality: t.call_cardinality.value,
						   method: t.call_method.value,
                           parameters: params,
                          });
		
		this.calls.push(ret);
		return ret;
	}

},
/* @Prototype */
{	
	init: function()
	{

	},
	
	contentType: function() {
		if ($.inArray(this.method, this.Class.payload_methods) !== -1) {
            var path = this.path
            var suffix = "/preferences";
            if (path.indexOf(suffix, path.length - suffix.length) !== -1) {
                // Preferences API call
                return "text/plain";
            } else {
                // All other calls
                return "application/rdf+xml";
            }
		}
		return "application/x-www-form-urlencoded";
	},
	
	callAPI: function(data, callback) {
		var args = this.buildCallArgs(data, callback);
		SMART.api_call(args[0], args[1]);
	},
	
	buildCallArgs: function(data, callback) {
        
        var params = ApiType.paramsArray(this.parameters);
        
		var call_args = [{
			method: this.method, 
			url: ApiType.interpolatedPath(this.path), 
			contentType: this.contentType(), 
			data: data || params
		}, callback];
	
		return call_args;
	}
});



$.Model.extend('ApiCallGroup',
/* @Static */
{

	init: function() {
		this.groups= [];
	},
	
	get_top_groups: function() {
		var g = $.grep(this.groups, function(g) {return (g.group_parent === null);});
		g.sort(function(a,b) {if (a.group_name === b.group_name) return 0; if (a.group_name < b.group_name) return -1; return 1;});
		return g;
	},
	
	make_groups: function() {
		this.make_record_item_groups();
	},
	
	make_record_item_groups: function() {
		this.record_item_groups_by_path();
		this.record_item_groups_by_target();
		
	},
	
	record_item_groups_by_path: function() {
		var by_path = {};
		
		$.each(ApiCall.calls, function(i, call) {
			if (by_path[call.path] === undefined )
				by_path[call.path] = [];
			by_path[call.path].push(call);
		});
		
		$.each(by_path, function(path, calls) {
			var gn = calls[0].cardinality;
			
			var p = {
					   group_name: gn,
					   group_members: calls,
					   group_parent: null,
					   group_indentation_hint: null,
					   group_type: ApiType.find_type(calls[0].target)
					 };
			
			var g = new ApiCallGroup({p: p})
			ApiCallGroup.groups.push(g);
		});
	},
	
	record_item_groups_by_target: function() {
		var by_target = {};
		$.each(ApiCallGroup.groups, function(i, group) {
			var t = group.group_members[0].target;
			if (by_target[t] === undefined )
				by_target[t] = [];
			by_target[t].push(group);			
		});
		
		$.each(by_target, function(target, groups) {
			groups.sort(function(a,b) {if (a.group_name === b.group_name) return 0; if (a.group_name > b.group_name) return -1; return 1;});
			
			var t= ApiType.find_type(target);

			var p = {
					   group_name: t.name,
					   group_members: groups,
					   group_parent: null,
					   group_indentation_hint: null,
					   group_type: groups[0].group_type
					 };
			var parent = new ApiCallGroup({p: p});
			ApiCallGroup.groups.push(parent);
			$.each(groups, function(i,g) {g.group_parent = parent});
		});
	}

},
/* @Prototype */
{	
	init: function()
	{
		this.group_name = this.p.group_name;
		this.group_members = this.p.group_members;
		
		// the group to which this belongs, if any
		this.group_parent = this.p.group_parent;
		
		// e.g. fills should be indented below meds 
		this.group_indentation_hint = this.p.group_indentation_hint;
		this.group_type = this.p.group_type;
    }    
});
