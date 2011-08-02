(function(context) {

    if (!context.smart_parser) {
	context.smart_parser = {};
    }

    // Manages a collection of SMART objects (meds, fulfillments, etc)
    // Can parse an rdfquery object to extract plain old JS objects
    var SMART_Object_Collection = function() {
	var items_by_type = {};
	var items_by_uri = {};
	var collection = this;
	this.parsed_payloads = [];

	// Parse an rdfquery payload to extract plain-old JS objects
	this.parse_rdf_payload = function(payload)  {
	    
	    var parsed_items = [];

	    // For every type we know about
	    $.each(context.smart_parser.type_definitions, function(oURI, o) {

		// If it's a top-level clinical statement type (e.g. Medication)
		if (!o.is_statement) return;

		// Then look for items of this type in the payload
		var items = parse_one_type(payload, o);
		$.each(items, function(i,item) {
		    parsed_items.push(item);
		});
	    });
	    
	    // Add all identified object to this collection.
	    $.each(parsed_items, function(i,item) {
		collection.add_item(make_structured(item));
	    });	    

	    // Expose the payload so the caller can find it later
	    this.parsed_payloads.push(payload);
	};

	// Add a new item to the collection
	this.add_item = function(i) {
	    var t = context.smart_parser.type_definitions[i.type];
	    if (!t.is_statement)
		throw "Only Statements can be added to a SMART Object collection, not " + t;
	    
	    items_by_type[t.name] || (items_by_type[t.name] = {});
	    items_by_type[t.name][i.uri] = i;
	    items_by_uri[i.uri] = i;
	};

	// Get all items from the collection, by type (e.g. "Medication")
	this.by_type = function(type_name) {
	    
	    // This function should only be called with a "clinical statement" type
	    // (e.g. it can be called to find all Medications, but not all CodedValues
	    // since CodedValues don't stand up on their own.)
	    var td = false;
	    $.each(context.smart_parser.type_definitions, 
		   function(tURI, t) {
		       if (t.is_statement && t.name == type_name)
			   td = true;
		   }); 
	    
	    if (!td || td.length == 0)
		throw "Only Statements can be retrieved to a SMART Object collection."
	    
	    var ret = [];
	    $.each(items_by_type[type_name], function(n, item){
		ret.push(item);
	    });
	    return ret;
	};
	
	// Get a single item from the collection, by URI
	this.by_uri = function(item_uri) {
	    return items_by_uri[item_uri];
	};
    };
    
    // Private helper function
    // (Here begins the mind-bending recurisve fun :-))
    function parse_one_type(payload, t, starting_from) {
	
	var subject_uri = starting_from && starting_from.uri || "?subject";
	
	//	console.log(t);
	var matches = payload.where(subject_uri + " rdf:type "+t.uri);
	//	console.log('payload.where("'+subject_uri+'" + " rdf:type "+'+t.uri+');)');
	
	$.each(t.data_properties, function(i, dp) {
	    matches = matches.optional(subject_uri + " " + dp.uri + " ?dp"+i);
	    //	    console.log('matches.optional('+subject_uri+' + " " + '+dp.uri+' + " ?dp"+'+i+');');
	});
	
	$.each(t.object_properties, function(i, op) {
	    matches = matches.optional(subject_uri + " " + op.uri + " ?op"+i);
	    //	    console.log('matches.optional('+subject_uri+' + " " + '+op.uri+' + " ?op"+'+i+');');
	});
	
	var matched_items = {};
	if (starting_from) 
	    matched_items[starting_from.uri] = starting_from;

	$.each(matches, function(i, match) {
	    var match_uri = starting_from && starting_from.uri || match['subject'].toString();

	    if (!matched_items[match_uri])
		matched_items[match_uri] = {
		    uri: match_uri,
		    type: t
		};
	    
            matched_items[match_uri].data_properties || 
		(matched_items[match_uri].data_properties = {});

	    $.each(t.data_properties, function(i, dp) {
		if (!match["dp"+i]) return;

		var ii = matched_items[match_uri].data_properties[dp.uri] || 
		    (matched_items[match_uri].data_properties[dp.uri] = {
			type: dp,
			values: []
		    });

		var v = match["dp"+i].value;

		if (v._string) v = v._string;
		if ($.inArray(v,ii.values) == -1) {
		    ii.values.push(v);
		}
 	    });
	    
  	    matched_items[match_uri].object_properties || 
		(matched_items[match_uri].object_properties = {});

	    $.each(t.object_properties, function(i, op) {
		if (!match["op"+i]) return;

		var ii = matched_items[match_uri].object_properties[op.uri] || 
		    (matched_items[match_uri].object_properties[op.uri] = {});
		if (!ii[match["op"+i]]) 
		    ii[match["op"+i]] = {
			uri: match["op"+i].toString(),
			type: context.smart_parser.type_definitions[op.target]
		    };	   
 	    });
	});	    
	    


	$.each(matched_items, function(iURL, item) {
	    if (!item.object_properties) return; 
	    $.each(item.object_properties, function(opURI, sub_item_set) {
		$.each(sub_item_set, function(subItemURI, sub_item) {
		    parse_one_type(payload, sub_item.type, sub_item);
		});
	    });
	});

	return matched_items;	
    };
    
    // private helper to make a nice plain-old JS object
    // from a raw parsed object
    function make_structured(item) {

	var structured_item = {
	    type: item.type.uri
	};

	if (item.uri && !(item.uri.match(/^_:/)))
	    structured_item.uri= item.uri;

	
	$.each(item.type.data_properties, function(i, dp) {
	    if (!item.data_properties) return;
	    if (!item.data_properties[dp.uri]) return;

	    if (dp.allow_list) {
		structured_item[dp.name] =  item.data_properties[dp.uri].values;
	    }
	    else {
		if (item.data_properties[dp.uri].values.length == 1)
		    structured_item[dp.name] =  item.data_properties[dp.uri].values[0];
		else if (item.data_properties[dp.uri].values.length > 1)
		    throw "Expected cardinality <= 1 for dp " + dp.name
	    }
	});
	
	$.each(item.type.object_properties, function(i, op) {
	    var structured_subitems = [];
	    if (!item.object_properties) return;
	    if (!item.object_properties[op.uri]) return;
	    $.each(item.object_properties[op.uri], function(siURI, subitem) {
		structured_subitems.push(make_structured(subitem));
	    });
	    
	    if (op.allow_list) {
		structured_item[op.name] =  structured_subitems;
	    }
	    
	    else {
		if (structured_subitems.length == 1)
		    structured_item[op.name] =  structured_subitems[0];
		else if (structured_subitems.length > 1)
		    throw "Expected cardinality <= 1";
	    }
	});
	
	return  structured_item;
    };
    
    context.smart_parser.Collection = SMART_Object_Collection;
})(window);