/*
 * SMART API client
 * Josh Mandel
 * Ben Adida
 */

var SMART_CONNECT_CLIENT = function(smart_server_origin, frame) {
    var debug = false;
    var _this = this;
    var sc = this;
    var channel = null;

    this.is_ready = false;

    this.ready = function(callback) {
	this.ready_callback = callback;
	if (this.is_ready) this.ready_callback();
    };

    var notification_handlers = {};
    this.bind_channel = function(scope) {
	channel = Channel.build({window: frame, origin: "*", scope: scope, debugOutput: debug});

	_this.on = function(n, cb) {
	  notification_handlers[n] = function(t, p) {
	    cb(p);
	  };

	  channel.bind(n, notification_handlers[n]);
	};

	_this.off = function(n, cb) {
	  channel.unbind(n, notification_handlers[n]);
	}

	_this.notify_host = function(n, p) {
	  channel.notify({
	      method: n,
	      params: p 
	    });
	};

	channel.bind("ready", function(trans, message) {
	    trans.complete(true);
	    sc.received_setup(message);
	});

    };

    var procureChannel = function(event){
	var app_instance_uuid = event.data.match(/^"app_instance_uuid=(.*)"$/);
	if (!app_instance_uuid) return;

	if (window.removeEventListener) window.removeEventListener('message', procureChannel, false);
	else if(window.detachEvent) window.detachEvent('onmessage', procureChannel);

	app_instance_uuid = app_instance_uuid[1];
	sc.bind_channel(app_instance_uuid);
    };

    if (window.addEventListener) window.addEventListener('message', procureChannel, false);
    else if(window.attachEvent) window.attachEvent('onmessage', procureChannel);
    window.parent.postMessage('"procure_channel"', "*");


    this.received_setup = function(message) {
	
	this.context = message.context;
	this.uuid = message.uuid;
	this.credentials = message.credentials;
	this.manifest = message.manifest;
	
	this.user = message.context.user;
	this.record = message.context.record;
	

	this.ready_data = message.ready_data;
	
 	this.is_ready = true;

	if (this.manifest.mode == "ui" || this.manifest.mode == "frame_ui")
	    this.assign_ui_handlers();
	
	if (this.manifest.mode == "frame_ui")
	    this.assign_frame_ui_handlers();

	if (this.ready_callback) this.ready_callback();
	
    };

    this.assign_ui_handlers = function() {
	this.api_call = function(options, callback) {
	    channel.call({method: "api_call",
			  params: 
			  {
			      'func' : options.url,
			      'method' : options.method,
			      'params' : options.data,
			      'contentType' : options.contentType || "application/x-www-form-urlencoded"
			  },
			  success: function(r) { callback(r.contentType, r.data); }
			 });
	};

	this.call_app = function(manifest, ready_data, callback) {
	    channel.call({method: "call_app",
			  params: 
			  {
			    manifest: manifest,
			    ready_data: ready_data
			  },
			  success: callback
			 });
	  
	};

	this.return = function(returndata) {

	    channel.notify({
	      method: "return",
	      params: returndata
	    });

	};
    }

    this.assign_frame_ui_handlers = function() {
	this.api_call_delegated = function(app_instance, call_info, success) {
	    channel.call({method: "api_call_delegated",
			  params: {
			      app_instance: {
				  uuid: app_instance.uuid,
				  context: app_instance.context,
				  credentials: app_instance.credentials,
				  manifest: app_instance.manifest
			      },
			      
			      call_info: call_info
			  },
			  success: success
			 });
	};
	
	this.launch_app_delegated = function(app_instance, success) {
	    channel.call({
		method: "launch_app_delegated",
		params:	{
		    uuid: app_instance.uuid,
		    context: app_instance.context,
		    credentials: app_instance.credentials, // (won't exist yet.)
		    manifest: app_instance.manifest
		},
		success: success
	    });
	};

	this.PATIENTS_get = function(success) {
	    sc.api_call({
		url: "/records/search",
		method: "GET"
	    }, function(contentType, data) {
		var rdf = sc.process_rdf(contentType, data);
		success({body: data, contentType: contentType, graph: rdf});
	    });
	};

    }
   
};

SMART_CONNECT_CLIENT.prototype.MANIFESTS_get = function(success) {
  this.api_call({
    url: "/apps/manifests",
    method: "GET"
  }, function(contentType, data) {
    success({body: data, contentType: contentType, json: JSON.parse(data)})
  });
};


SMART_CONNECT_CLIENT.prototype.MANIFEST_get = function(descriptor, success) {
  this.api_call({
    url: "/apps/"+descriptor+"/manifest",
    method: "GET"
  }, function(contentType, data) {
    success({body: data, contentType: contentType, json: JSON.parse(data)})
  });
};

SMART_CONNECT_CLIENT.prototype.ONTOLOGY_get = function(callback) {
	var _this = this;
	this.api_call( {
		method : 'GET',
		url : "/ontology",
		data : {}
	}, function(contentType, data) {
		var rdf = _this.process_rdf(contentType, data);
		callback({body: data, contentType: contentType, graph: rdf});
	});
};

SMART_CONNECT_CLIENT.prototype.FULFILLMENTS_get = function(callback) {
	var _this = this;
	this.api_call( {
		method : 'GET',
		url : "/records/" + _this.record.id + "/fulfillments/",
		data : {}
	}, function(contentType, data) {
		var rdf = _this.process_rdf(contentType, data);
		callback({body: data, contentType: contentType, graph: rdf});
	});

};

SMART_CONNECT_CLIENT.prototype.LAB_RESULTS_get = function(callback) {
	var _this = this;
	this.api_call( {
		method : 'GET',
		url : "/records/" + _this.record.id + "/lab_results/",
		data : {}
	}, function(contentType, data) {
		var rdf = _this.process_rdf(contentType, data);
		callback({body: data, contentType: contentType, graph: rdf});
	});

};

SMART_CONNECT_CLIENT.prototype.VITAL_SIGNS_get = function(callback) {
	var _this = this;
	this.api_call( {
		method : 'GET',
		url : "/records/" + _this.record.id + "/vital_signs/",
		data : {}
	}, function(contentType, data) {
		var rdf = _this.process_rdf(contentType, data);
		callback({body: data, contentType: contentType, graph: rdf});
	});
};

SMART_CONNECT_CLIENT.prototype.DEMOGRAPHICS_get = function(callback) {
	var _this = this;
	this.api_call( {
		method : 'GET',
		url : "/records/" + _this.record.id + "/demographics",
		data : {}
	}, function(contentType, data) {
		var rdf = _this.process_rdf(contentType, data);
		callback({body: data, contentType: contentType, graph: rdf});
	});

};

	

SMART_CONNECT_CLIENT.prototype.MEDS_get = function(callback) {
	var _this = this;
	this.api_call( {
		method : 'GET',
		url : "/records/" + _this.record.id + "/medications/",
		data : {}
	}, function(contentType, data) {
		var rdf = _this.process_rdf(contentType, data);
		callback({body: data, contentType: contentType, graph: rdf});
	});

};

SMART_CONNECT_CLIENT.prototype.MEDS_get_all = SMART_CONNECT_CLIENT.prototype.MEDS_get;

SMART_CONNECT_CLIENT.prototype.MEDS_post = function(data, callback) {
	var _this = this;
	this.api_call( {
		method : 'POST',
		url : "/records/" + _this.record.id + "/medications/",
		contentType : 'application/rdf+xml',
		data : data
	}, function(contentType, data) {
		callback({body: data, contentType: contentType, graph: undefined});
	});
};

SMART_CONNECT_CLIENT.prototype.MEDS_delete = function(callback) {
	var _this = this;
	this.api_call( {
		method : 'DELETE',
		url : "/records/" + _this.record.id + "/medications/",
		data : {}
	}, function(contentType, data) {
		callback({body: data, contentType: contentType, graph: undefined});
	});
};

SMART_CONNECT_CLIENT.prototype.MED_delete = function(uri, callback) {
	var _this = this;
	this.api_call( {
		method : 'DELETE',
		url : uri,
		data : {}
	}, function(contentType, data) {
		callback({body: data, contentType: contentType, graph: undefined});
	});
};

SMART_CONNECT_CLIENT.prototype.MED_put = function(data, external_id, callback) {
	var _this = this;
	this.api_call( {
		method : 'PUT',
		url : "/records/" + _this.record.id + "/medications/external_id/"
				+ external_id,
		contentType : 'application/rdf+xml',
		data : data
	}, function(contentType, data) {
		var rdf = _this.process_rdf(contentType, data);
		callback({body: data, contentType: contentType, graph: rdf});
	});

};

SMART_CONNECT_CLIENT.prototype.PROBLEMS_get = function(callback) {
	var _this = this;
	this.api_call( {
		method : 'GET',
		url : "/records/" + _this.record.id + "/problems/",
		data : {}
	}, function(contentType, data) {
		var rdf = _this.process_rdf(contentType, data);
		callback({body: data, contentType: contentType, graph: rdf});
	});
};

SMART_CONNECT_CLIENT.prototype.PROBLEMS_post = function(data, callback) {
	var _this = this;
	this.api_call( {
		method : 'POST',
		url : "/records/" + _this.record.id + "/problems/",
		contentType : 'application/rdf+xml',
		data : data
	}, function(contentType, data) {
		callback({body: data, contentType: contentType, graph: undefined});
	});
};

SMART_CONNECT_CLIENT.prototype.PROBLEMS_delete = function(problem_uri, callback) {
	var _this = this;

	this.api_call( {
		method : 'DELETE',
		url : problem_uri,
		data : {}
	}, function(contentType, data) {
		callback({body: data, contentType: contentType, graph: undefined});
	});
};

SMART_CONNECT_CLIENT.prototype.PROBLEM_put = function(data, external_id, callback) {
	var _this = this;
	this.api_call( {
		method : 'PUT',
		url : "/records/" + _this.record.id + "/problems/external_id/"
				+ external_id,
		contentType : 'application/rdf+xml',
		data : data
	}, function(contentType, data) {
		var rdf = _this.process_rdf(contentType, data);
		callback({body: data, contentType: contentType, graph: rdf});
	});
};

SMART_CONNECT_CLIENT.prototype.NOTES_get = function(callback) {
	var _this = this;
	this.api_call( {
		method : 'GET',
		url : "/records/" + _this.record.id + "/notes/",
		data : {}
	}, function(contentType, data) {
		var rdf = _this.process_rdf(contentType, data);
		callback({body: data, contentType: contentType, graph: rdf});
	});
};

SMART_CONNECT_CLIENT.prototype.NOTES_post = function(data, callback) {
	var _this = this;
	this.api_call( {
		method : 'POST',
		url : "/records/" + _this.record.id + "/notes/",
		contentType : 'application/rdf+xml',
		data : data
	}, function(contentType, data) {
		callback({body: data, contentType: contentType, graph: undefined});
	});
};

SMART_CONNECT_CLIENT.prototype.NOTES_delete = function(note_uri, callback) {
	var _this = this;

	this.api_call( {
		method : 'DELETE',
		url : note_uri,
		data : {}
	}, function(contentType, data) {
		callback({body: data, contentType: contentType, graph: undefined});
	});
};

SMART_CONNECT_CLIENT.prototype.NOTE_put = function(data, external_id, callback) {
	var _this = this;
	this.api_call( {
		method : 'PUT',
		url : "/records/" + _this.record.id + "/notes/external_id/"
				+ external_id,
		contentType : 'application/rdf+xml',
		data : data
	}, function(contentType, data) {
		var rdf = _this.process_rdf(contentType, data);
		callback({body: data, contentType: contentType, graph: rdf});
	});
};


SMART_CONNECT_CLIENT.prototype.ALLERGIES_get = function(callback) {
	var _this = this;
	this.api_call( {
		method : 'GET',
		url : "/records/" + _this.record.id + "/allergies/",
		data : {}
	}, function(contentType, data) {
		var rdf = _this.process_rdf(contentType, data);
		callback({body: data, contentType: contentType, graph: rdf});
	});
};

SMART_CONNECT_CLIENT.prototype.ALLERGIES_post = function(data, callback) {
	var _this = this;
	this.api_call( {
		method : 'POST',
		url : "/records/" + _this.record.id + "/allergies/",
		contentType : 'application/rdf+xml',
		data : data
	}, function(contentType, data) {
		callback({body: data, contentType: contentType, graph: undefined});
	});
};

SMART_CONNECT_CLIENT.prototype.ALLERGIES_delete = function(allergy_uri, callback) {
	var _this = this;

	this.api_call( {
		method : 'DELETE',
		url : allergy_uri,
		data : {}
	}, function(contentType, data) {
		callback({body: data, contentType: contentType, graph: undefined});
	});
};

SMART_CONNECT_CLIENT.prototype.ALLERGY_put = function(data, external_id, callback) {
	var _this = this;
	this.api_call( {
		method : 'PUT',
		url : "/records/" + _this.record.id + "/allergies/external_id/"
				+ external_id,
		contentType : 'application/rdf+xml',
		data : data
	}, function(contentType, data) {
		var rdf = _this.process_rdf(contentType, data);
		callback({body: data, contentType: contentType, graph: rdf});
	});
};



SMART_CONNECT_CLIENT.prototype.CODING_SYSTEM_get = function(system, query, callback) {
	var _this = this;
	this.api_call( {
		method : 'GET',
		url : "/codes/systems/" + system + "/query",
		data : {
			q : query
		}
	}, function(contentType, data) {
		var js = JSON.parse(data);
		callback({body: data, contentType: contentType, graph: js});
	});
}

SMART_CONNECT_CLIENT.prototype.SPL_get = function(query, callback) {
	var _this = this;
	this.api_call( {
		method : 'GET',
		url : "/spl/for_rxnorm/" + query,
		data : {}
	}, function(contentType, data) {
		var rdf = _this.process_rdf(contentType, data);
		callback({body: data, contentType: contentType, graph: rdf});
	});
};


SMART_CONNECT_CLIENT.prototype.webhook_post = function(webhook_name, data, callback) {
	var _this = this;
	this.api_call( {
		method : 'POST',
		contentType : 'application/rdf+xml',
		url : "/webhook/"+webhook_name,
		data : data
		}, function(contentType, data) {
		var rdf = _this.process_rdf(contentType, data);
		callback({body: data, contentType: contentType, graph: rdf});
	});
};


SMART_CONNECT_CLIENT.prototype.webhook_get = function(webhook_name, data, callback) {
	var _this = this;
	this.api_call( {
		method : 'GET',
		url : "/webhook/"+webhook_name,
		data : data
		}, function(contentType, data) {
		var rdf = _this.process_rdf(contentType, data);
		callback({body: data, contentType: contentType, graph: rdf});
	});
};

SMART_CONNECT_CLIENT.prototype.webhook = SMART_CONNECT_CLIENT.prototype.webhook_get;

SMART_CONNECT_CLIENT.prototype.CAPABILITIES_get = function(callback) {
	var _this = this;
	this
			.api_call(
					{
						method : 'GET',
						url : "/capabilities/",
						data : {}
					},
					function(contentType, data) {
						_this.capabilities = JSON.parse(data)
						callback({body: data, contentType: contentType, graph: undefined});
					});
}

SMART_CONNECT_CLIENT.prototype.AUTOCOMPLETE_RESOLVER = function(system) {
	var _this = this;
	var source = function(request, response) {
		_this.CODING_SYSTEM_get(system, request.term, function(json) {
			response(jQuery.map(json, function(item) {
				return {
					label : item.full_value,
					value : item.code
				};
			}));
		})
	};

	return source;
}

SMART_CONNECT_CLIENT.prototype.SPARQL = function(query, callback) {
	var _this = this;
	this.api_call( {
		method : 'GET',
		url : "/records/" + _this.record.id + "/sparql",
		data : {
			q : query
		}
	}, function(contentType, data) {
		var rdf = _this.process_rdf(contentType, data);
		callback({body: data, contentType: contentType, graph: rdf});
	});
};

SMART_CONNECT_CLIENT.prototype.PREFERENCES_put = function(data, content_type, callback) {
	var _this = this;
	this.api_call( {
		method : 'PUT',
		contentType : content_type,
		url : "/accounts/" + _this.user.id + "/apps/" + _this.manifest.id + "/preferences",
		data : data
    }, function(contentType, data) {
		callback({body: data, contentType: contentType, graph: undefined});
	});
};

SMART_CONNECT_CLIENT.prototype.PREFERENCES_get = function(callback) {
	var _this = this;
	this.api_call( {
		method : 'GET',
		url : "/accounts/" + _this.user.id + "/apps/" + _this.manifest.id + "/preferences",
		data : {}
	}, function(contentType, data) {
		callback({body: data, contentType: contentType, graph: undefined});
	});
};

SMART_CONNECT_CLIENT.prototype.PREFERENCES_delete = function(callback) {
	var _this = this;

	this.api_call( {
		method : 'DELETE',
		url : "/accounts/" + _this.user.id + "/apps/" + _this.manifest.id + "/preferences",
		data : {}
	}, function(contentType, data) {
		callback({body: data, contentType: contentType, graph: undefined});
	});
};

SMART_CONNECT_CLIENT.prototype.createXMLDocument = function(string) {
    var parser, xmlDoc;
    if (window.DOMParser)
	{
	    parser = new DOMParser();
	    xmlDoc = parser.parseFromString(string, 'text/xml');
	}
    else
	{
	    xmlDoc = new ActiveXObject('Microsoft.XMLDOM');
	    xmlDoc.async = 'false';
	    xmlDoc.loadXML(string);
	}
    return xmlDoc;
};

SMART_CONNECT_CLIENT.prototype.node_name = function(node) {
	node = node.value;
    if (node._string !== undefined)
    { node = "<"+node._string+">";}
    return node;
};


SMART_CONNECT_CLIENT.prototype.process_rdf = function(contentType, data) {

	// Get the triples into jquery.rdf
	var d = this.createXMLDocument(data);

	var rdf = jQuery.rdf();
	rdf.base("");

		rdf.load(d, {});
		// Load all the namespaces from the xml+rdf into jquery.rdf
	var r = d.childNodes[0];
	if (r.nodeName !== "RDF" && r.nodeName !== "rdf:RDF")
	    r = d.childNodes[1];
        if (r.attributes === null)
            r = d.childNodes[1];

	
	for ( var i = 0; i < r.attributes.length; i++) {
	    a = r.attributes[i];
	    try {
		var match = /xmlns:(.*)/i.exec(a.nodeName);
		if (match.length == 2) {
		    rdf.prefix(match[1], a.nodeValue);
		}
	    } catch (err) {}
	}

	rdf.prefix("sp", "http://smartplatforms.org/terms#");
	rdf.prefix("dc","http://purl.org/dc/elements/1.1/");
	rdf.prefix("dcterms", "http://purl.org/dc/terms/");

	return rdf;
}


SMART = new SMART_CONNECT_CLIENT(null, window.parent);
