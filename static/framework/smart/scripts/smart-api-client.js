/*
 * SMArt API client
 *
 * randomUUID is included at the bottom from:
 * http://ajaxian.com/archives/uuid-generator-in-javascript
 * 
 * Josh Mandel
 * Ben Adida
 */

var SMART_CLIENT = function(smart_server_origin, frame) {
	var _this = this;

	this.init = function() {
		// the init code has moved down here...
		this.smart_server_origin = smart_server_origin;
		this.frame = frame;

		this.active_calls = {};

		// register the message receiver
		// wrap in a function because of "this" binding

		window.addEventListener("message", function(message) {
			_this.receive_message(message);
		}, false);

	}
	
	this.init();

	this.send_ready_message = function(ready_callback) {
		loadJQuery(function() {
			var call_uuid = randomUUID();
			_this.active_calls[call_uuid] = ready_callback;
			
			// FIXME: we are not setting a destination constraint here
			_this.frame.postMessage(
					JSON.stringify({
							'type' : 'ready',
							'call_uuid': call_uuid}), 
					'*');
		});
	};

    // a message received from the SMArt container
	this.receive_message = function(event) {
		// only listen for events from the SMArt container origin
		if (this.smart_server_origin != null
				&& event.origin != this.smart_server_origin)
			return;

		// parse message
		var parsed_message = JSON.parse(event.data);

		// setup message with credentials and initial data
		if (parsed_message.type == 'setup') {
			// FIXME: for now we are binding this client when it
			// receives the setup message.
			// easier for development, may need some work
			this.smart_server_origin = event.origin;
			if (this.smart_server_origin === "null")
				this.smart_server_origin = "*";

			this.receive_setup_message(parsed_message);
		}

		// api return
		if (parsed_message.type == 'apireturn') {
			this.receive_apireturn_message(parsed_message);
		}
		
		// api return
		if (parsed_message.type == 'activityreturn') {
			this.receive_activityreturn_message(parsed_message);
		}
		// api return
		if (parsed_message.type == 'activitybackground') {
			this.message_receivers.background();
		}
		// api return
		if (parsed_message.type == 'activityforeground') {
			this.message_receivers.foreground();
		}
	},

	this.receive_setup_message = function(message) {
		var ready_callback = this.active_calls[message.call_uuid];
		if (!ready_callback)
			return;
		
		this.credentials = message.credentials;
		this.record_info = message.record_info;
		this.activity_id = message.activity_id;
		this.ready_data = message.ready_data;
		
		var _this = this;
		this.CAPABILITIES_get(function() {
			ready_callback(_this.record_info, _this.ready_data);
		});
	};

	this.receive_apireturn_message = function(message) {
		var callback = this.active_calls[message.call_uuid];

		if (callback == null) {
			return;
		}

		// unwrap the content-type
		callback(message.content_type, message.payload);

		// FIXME: we should parse payload XML and JSON here, depending on
		// content type.

		// clear out the callback
		this.active_calls[message.call_uuid] = null;
	};

	this.receive_activityreturn_message = function(message) {
		this.receive_apireturn_message(message);
	};

	
	// generic api_call function
			// api calls have a function name and named variables
			// we have to track the calls because asynchronicity might
			// make the results come back in a different order
	this.api_call = function(options, callback) {
		var call_uuid = randomUUID();
		this.active_calls[call_uuid] = callback;

		this.frame.postMessage(JSON.stringify( {
			'activity_id': this.activity_id,
			'type' : 'apicall',
			'call_uuid' : call_uuid,
			'func' : options.url,
			'method' : options.method,
			'params' : options.data,
			'contentType' : options.contentType
					|| "application/x-www-form-urlencoded"
		}), this.smart_server_origin);
	};

	this.start_activity = function(activity_name, app_id, ready_data, callback) {
		if (arguments.length < 4) {
			return this.start_activity(activity_name, null,  app_id, ready_data);
		}
		
		var call_uuid = randomUUID();
		this.active_calls[call_uuid] = callback;

		this.frame.postMessage(JSON.stringify( {
			'activity_id': this.activity_id,
			'type' : 'start_activity',
			'call_uuid' : call_uuid,
			'name' : activity_name,
			'app' : app_id,
			'ready_data': ready_data
		}), this.smart_server_origin);
	};

	
	this.end_activity = function(response, callback) {
		var call_uuid = randomUUID();
		this.active_calls[call_uuid] = null;

		this.frame.postMessage(JSON.stringify( {
			'activity_id': this.activity_id,
			'type' : 'end_activity',
			'call_uuid' : call_uuid,
			'response': response
		}), this.smart_server_origin);
	};



/*
 * randomUUID.js - Version 1.0
 * 
 * Copyright 2008, Robert Kieffer
 * 
 * This software is made available under the terms of the Open Software License
 * v3.0 (available here: http://www.opensource.org/licenses/osl-3.0.php )
 * 
 * The latest version of this file can be found at:
 * http://www.broofa.com/Tools/randomUUID.js
 * 
 * For more information, or to comment on this, please go to:
 * http://www.broofa.com/blog/?p=151
 */

/**
 * Create and return a "version 4" RFC-4122 UUID string.
 */
function randomUUID() {
	var s = [], itoh = '0123456789ABCDEF';
	// Make array of random hex digits. The UUID only has 32 digits in it, but
	// we
	// allocate an extra items to make room for the '-'s we'll be inserting.
	for ( var i = 0; i < 36; i++)
		s[i] = Math.floor(Math.random() * 0x10);
	// Conform to RFC-4122, section 4.4
	s[14] = 4; // Set 4 high bits of time_high field to version
	s[19] = (s[19] & 0x3) | 0x8; // Specify 2 high bits of clock sequence
	// Convert to hex chars
	for ( var i = 0; i < 36; i++)
		s[i] = itoh[s[i]];
	// Insert '-'s
	s[8] = s[13] = s[18] = s[23] = '-';
	return s.join('');
}

/**
 * end of randomUUID
 */

SMART_CLIENT.prototype.MEDS_get = function(callback) {
	var _this = this;
	this.api_call( {
		method : 'GET',
		url : "/records/" + _this.record_info.id + "/medications/",
		data : {}
	}, function(contentType, data) {
		var rdf = _this.process_rdf(contentType, data);
		callback(rdf);
	});

};

SMART_CLIENT.prototype.MEDS_get_all = SMART_CLIENT.prototype.MEDS_get;

SMART_CLIENT.prototype.MEDS_post = function(data, callback) {
	var _this = this;
	this.api_call( {
		method : 'POST',
		url : "/records/" + _this.record_info.id + "/medications/",
		contentType : 'application/rdf+xml',
		data : data
	}, function(contentType, data) {
		callback(data);
	});
};

SMART_CLIENT.prototype.MEDS_delete = function(callback) {
	var _this = this;
	this.api_call( {
		method : 'DELETE',
		url : "/records/" + _this.record_info.id + "/medications/",
		data : {}
	}, function(contentType, data) {
		callback(data);
	});
};

SMART_CLIENT.prototype.MED_delete = function(uri, callback) {
	var _this = this;
	this.api_call( {
		method : 'DELETE',
		url : uri,
		data : {}
	}, function(contentType, data) {
		callback(data);
	});
};

SMART_CLIENT.prototype.MED_put = function(data, external_id, callback) {
	var _this = this;
	this.api_call( {
		method : 'PUT',
		url : "/records/" + _this.record_info.id + "/medications/external_id/"
				+ external_id,
		contentType : 'application/rdf+xml',
		data : data
	}, function(contentType, data) {
		var rdf = _this.process_rdf(contentType, data);
		callback(rdf);
	});

};

SMART_CLIENT.prototype.PROBLEMS_get = function(callback) {
	var _this = this;
	this.api_call( {
		method : 'GET',
		url : "/records/" + _this.record_info.id + "/problems/",
		data : {}
	}, function(contentType, data) {
		var rdf = _this.process_rdf(contentType, data);
		callback(rdf);
	});
};

SMART_CLIENT.prototype.PROBLEMS_post = function(data, callback) {
	var _this = this;
	this.api_call( {
		method : 'POST',
		url : "/records/" + _this.record_info.id + "/problems/",
		contentType : 'application/rdf+xml',
		data : data
	}, function(contentType, data) {
		callback(data);
	});
};

SMART_CLIENT.prototype.PROBLEMS_delete = function(problem_uri, callback) {
	var _this = this;

	this.api_call( {
		method : 'DELETE',
		url : problem_uri,
		data : {}
	}, function(contentType, data) {
		callback(data);
	});
};

SMART_CLIENT.prototype.PROBLEM_put = function(data, external_id, callback) {
	var _this = this;
	this.api_call( {
		method : 'PUT',
		url : "/records/" + _this.record_info.id + "/problems/external_id/"
				+ external_id,
		contentType : 'application/rdf+xml',
		data : data
	}, function(contentType, data) {
		var rdf = _this.process_rdf(contentType, data);
		callback(rdf);
	});
};

SMART_CLIENT.prototype.CODING_SYSTEM_get = function(system, query, callback) {
	var _this = this;
	this.api_call( {
		method : 'GET',
		url : "/codes/systems/" + system + "/query",
		data : {
			q : query
		}
	}, function(contentType, data) {
		var js = JSON.parse(data);
		callback(js);
	});
}

SMART_CLIENT.prototype.SPL_get = function(query, callback) {
	var _this = this;
	this.api_call( {
		method : 'GET',
		url : "/spl/for_rxnorm/" + query,
		data : {}
	}, function(contentType, data) {
		var rdf = _this.process_rdf(contentType, data);
		callback(rdf);
	});
};


SMART_CLIENT.prototype.webhook_post = function(webhook_name, data, callback) {
	var _this = this;
	this.api_call( {
		method : 'POST',
		contentType : 'application/rdf+xml',
		url : "/webhook/"+webhook_name,
		data : data
		}, function(contentType, data) {
		var rdf = _this.process_rdf(contentType, data);
		callback(rdf);
	});
};


SMART_CLIENT.prototype.webhook_get = function(webhook_name, data, callback) {
	var _this = this;
	this.api_call( {
		method : 'GET',
		url : "/webhook/"+webhook_name,
		data : data
		}, function(contentType, data) {
		var rdf = _this.process_rdf(contentType, data);
		callback(rdf);
	});
};

SMART_CLIENT.prototype.webhook = SMART_CLIENT.prototype.webhook_get;

SMART_CLIENT.prototype.CAPABILITIES_get = function(callback) {
	var _this = this;
	this
			.api_call(
					{
						method : 'GET',
						url : "/capabilities/",
						data : {}
					},
					function(contentType, data) {
						var rdf = _this.process_rdf(contentType, data);
						cs = rdf
								.where(
										"?platform  rdf:type  <http://smartplatforms.org/container>")
								.where(
										"?platform   <http://smartplatforms.org/capability> ?cap");

						_this.capabilities = {}
						for ( var i = 0; i < cs.length; i++) {
							_this.capabilities[cs[i].cap.value._string] = true;
						}

						callback(rdf);
					});
}

SMART_CLIENT.prototype.AUTOCOMPLETE_RESOLVER = function(system) {
	var _this = this;
	var source = function(request, response) {
		_this.CODING_SYSTEM_get(system, request.term, function(json) {
			response(jQuery.map(json, function(item) {
				return {
					label : item.full_value,
					value : item.umls_code
				};
			}));
		})
	};

	return source;
}

SMART_CLIENT.prototype.SPARQL = function(query, callback) {
	var _this = this;
	this.api_call( {
		method : 'GET',
		url : "/records/" + _this.record_info.id + "/sparql",
		data : {
			q : query
		}
	}, function(contentType, data) {
		var rdf = _this.process_rdf(contentType, data);
		callback(rdf);
	});
};

SMART_CLIENT.prototype.createXMLDocument = function(string) {
	return (new DOMParser()).parseFromString(string, 'text/xml');
};

SMART_CLIENT.prototype.node_name = function(node) {
	node = node.value;
    if (node._string !== undefined)
    { node = "<"+node._string+">";}
    return node;
};

SMART_CLIENT.prototype.to_json = function(rdf) {

	var triples = rdf.where("?s ?p ?o");
	var resources = {};
	
	for (var i = 0; i < triples.length; i++) {
	
		var t = triples[i];
		var s = t.s;
		var p = t.p;
		var o = t.o;
		
		if (resources[s.value._string] === undefined)
			resources[s.value._string] = {};

		if (resources[s.value._string][p.value._string] === undefined)
			resources[s.value._string][p.value._string] = [];
		
		if (p.value._string === "http://www.w3.org/1999/02/22-rdf-syntax-ns#type" )
		{
			if (resources[o.value._string] === undefined)
				resources[o.value._string] = [];
			
			resources[o.value._string].push(resources[s.value._string]);
		}

		if (o.type !== "literal" && resources[o.value._string] === undefined )
			resources[o.value._string] = {};

		if (t.o.type === "literal")
			resources[s.value._string][p.value._string].push(o.value);
		else
			resources[s.value._string][p.value._string].push(resources[o.value._string]);
		
	}
	
	return resources;	
},

SMART_CLIENT.prototype.process_rdf = function(contentType, data) {

	if (contentType !== "xml")
		throw "getRDF expected an XML document... got " + contentType;

	// Get the triples into jquery.rdf
	var d = this.createXMLDocument(data);

	var rdf = jQuery.rdf();
	rdf.base("");

	try {
		var t1 = new Date().getTime();
		rdf.load(d, {});
		var t2 = new Date().getTime();
//		alert("parsed in " + (t2-t1) + ".");
		// Load all the namespaces from the xml+rdf into jquery.rdf
		for ( var i = 0; i < d.firstChild.attributes.length; i++) {
			a = d.firstChild.attributes[i];
			var match = /xmlns:(.*)/i.exec(a.nodeName);
			if (match.length == 2) {
				rdf.prefix(match[1], a.nodeValue);
			}
		}
	} catch (err) {
	}

	rdf.prefix("sp", "http://smartplatforms.org/");
	rdf.prefix("dc","http://purl.org/dc/elements/1.1/");
	rdf.prefix("dcterms", "http://purl.org/dc/terms/");
	rdf.prefix("med","http://smartplatforms.org/medication#");

	// abstract method to instantiate a list of objects from the rdf store.
	var _this = this;
	rdf.to_json = function() {
		return _this.to_json(rdf);
	};
	rdf.source_xml = data;
	return rdf;
}


var loadJQuery = function(callback) {
	var load = function(filenames) {
		load.getScripts(filenames);
	}

	load.getScripts = function(filenames) {
		if (filenames.length === 0)
			return callback();

		if (filenames.length > 1) {
			load.callback = function() {
				load.getScripts(filenames.slice(1))
			};
		}

		else
			load.callback = callback;
		load.getScript(filenames[0]);
	};

	// dynamically load any javascript file.
	load.getScript = function(filename) {
		var script = document.createElement('script');
		script.setAttribute("type", "text/javascript");
		script.setAttribute("src", filename.url);
		load.filename = filename;
		if (typeof script !== "undefined")
			document.getElementsByTagName("head")[0].appendChild(script);
		load.tryReady(0);
	};

	load.tryReady = function(time_elapsed) {
		// Continually polls to see if dependency is loaded.
		if (load.filename()) { // if dependency isn't loaded yet...
			if (time_elapsed <= 10000) { // and we havn't given up///
				setTimeout(function() {
					load.tryReady(time_elapsed + 200);
				}, 200); // set a timer to check again in 200 ms.
			} else {
				alert("Timed out while loading dependency: "+ load.filename.url);
			}
		} else {
			load.callback();
		}
	};

	var filenames = [];
	var need_rest = false;

	var need_jquery = function() {
		return (typeof (jQuery) === "undefined" || typeof (jQuery.fn) === "undefined");
	};
	need_jquery.url = "http://ajax.googleapis.com/ajax/libs/jquery/1.4.2/jquery.js";

	var need_ui = function() {
		try {
			return (typeof (jQuery.fn.autocomplete) === "undefined");
		} catch (e) {
			return true;
		}
	};
	need_ui.url = "http://ajax.googleapis.com/ajax/libs/jqueryui/1.8.2/jquery-ui.js";

	var need_rdf = function() {
		try {
			return (typeof (jQuery.rdf) === "undefined");
		} catch (e) {
			return true;
		}
	};
	need_rdf.url = "http://sample-apps.smartplatforms.org:80/framework/smart/scripts/jquery.rdfquery.core-1.0.js";

	var funcs = [ need_jquery, need_ui, need_rdf ];

	for ( var i = 0; i < funcs.length; i++)
		if (funcs[i]())
			filenames.push(funcs[i]);

	load(filenames);
};


};