/*
 * SMArt API client
 * Josh Mandel
 * Ben Adida
 */

var SMART_CLIENT = function(smart_server_origin, frame) {
    var debug = false;
	var _this = this;
	this.message_receivers = {};
	this.send_ready_message = function(ready_callback) {
		this.smart_server_origin = smart_server_origin;
		this.frame = frame;
		var _this = this;

		loadDependencies(function() {
			_this.channel = Channel.build({window: frame, origin: "*", scope:"not_ready", debugOutput: debug});
			_this.ready_callback = ready_callback;
			var params = {}
			if (_this.app_name!== undefined) { params.app_name = _this.app_name; }
			_this.channel.call({method: "ready", 
							params: params,
				            success: _this.callback(_this.received_setup)
				           });
		});
	};

	this.callback = function(f) {
	    var _this = this;
	    return function() {return f.apply(_this, arguments);};
	},

        this.received_setup = function(message) {
	    this.channel.destroy();
	    this.channel = Channel.build({window: frame, origin: "*", scope: message.activity_id, debugOutput: debug});

	    this.channel.bind("activityforeground", this.callback(function() {
			if (this.message_receivers.foreground !== undefined)
			    this.message_receivers.foreground();
		    }));

	    this.channel.bind("activitybackground", this.callback(function() {
			if (this.message_receivers.background !== undefined)
			this.message_receivers.background();
		    }));

	    this.channel.bind("activitydestroy", this.callback(function() {
		    document.cookie = this.cookie_name+'=;path=/;expires=Thu, 01-Jan-1970 00:00:01 GMT;';
			if (this.message_receivers.background !== undefined)
				this.message_receivers.destroy();
		    }));
			    
	    this.user = message.user;
	    this.record = message.record;
	    this.credentials = message.credentials;
	    this.ready_data = message.ready_data;
	    this.cookie_name = "";

    	if (message.credentials && message.credentials.oauth_cookie !== undefined ){

            var existing_cookies = document.cookie.split(";");
            n = existing_cookies.length;
            while (n > 10) {
            	n = n-1;
                old_cookie_name = existing_cookies[n].split("=")[0].trim();
                if (old_cookie_name.match("^smart_oauth_cookie") !== null)
                	document.cookie = old_cookie_name+'=;path=/;expires=Thu, 01-Jan-1970 00:00:01 GMT;';
            }

	    this.cookie_name ='smart_oauth_cookie' + message.activity_id;    		
	    document.cookie = this.cookie_name+'='+escape(message.credentials.oauth_cookie)+";path=/";
	    }

    	var _this = this;
	    this.CAPABILITIES_get(function() {
		    _this.ready_callback({user: message.user, record: message.record}, _this.ready_data);
		});
	    
	};
	
	this.api_call = function(options, callback) {
	    this.channel.call({method: "api_call",
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

	this.start_activity = function(activity_name, app_id, ready_data, callback) {
		if (arguments.length < 4) {
			return this.start_activity(activity_name, null,  app_id, ready_data);
		}

		this.channel.call({method: "start_activity",
			       params: {
			'name' : activity_name,
			'app' : app_id,
			'ready_data': ready_data
			},
				   success: function(r){callback(r.contentType, r.data)}
		});
	};

	
	this.end_activity = function(response, callback) {
	    this.channel.call({method: "end_activity",
			       params: {
			'response': response
		    },
			       success: callback||function(){}
		});
	};

	this.restart_activity = function(callback) {
	    this.channel.call({method: "restart_activity", params: {}, success: callback||function(){}});
	};

SMART_CLIENT.prototype.ONTOLOGY_get = function(callback) {
	var _this = this;
	this.api_call( {
		method : 'GET',
		url : "/ontology",
		data : {}
	}, function(contentType, data) {
		var rdf = _this.process_rdf(contentType, data);
		callback(rdf);
	});
};

SMART_CLIENT.prototype.FULFILLMENTS_get = function(callback) {
	var _this = this;
	this.api_call( {
		method : 'GET',
		url : "/records/" + _this.record.id + "/fulfillments/",
		data : {}
	}, function(contentType, data) {
		var rdf = _this.process_rdf(contentType, data);
		callback(rdf);
	});

};

SMART_CLIENT.prototype.LABS_RESULTS_get = function(callback) {
	var _this = this;
	this.api_call( {
		method : 'GET',
		url : "/records/" + _this.record.id + "/lab_results/",
		data : {}
	}, function(contentType, data) {
		var rdf = _this.process_rdf(contentType, data);
		callback(rdf);
	});

};

SMART_CLIENT.prototype.DEMOGRAPHICS_get = function(callback) {
	var _this = this;
	this.api_call( {
		method : 'GET',
		url : "/records/" + _this.record.id + "/demographics",
		data : {}
	}, function(contentType, data) {
		var rdf = _this.process_rdf(contentType, data);
		callback(rdf);
	});

};

	

SMART_CLIENT.prototype.MEDS_get = function(callback) {
	var _this = this;
	this.api_call( {
		method : 'GET',
		url : "/records/" + _this.record.id + "/medications/",
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
		url : "/records/" + _this.record.id + "/medications/",
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
		url : "/records/" + _this.record.id + "/medications/",
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
		url : "/records/" + _this.record.id + "/medications/external_id/"
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
		url : "/records/" + _this.record.id + "/problems/",
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
		url : "/records/" + _this.record.id + "/problems/",
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
		url : "/records/" + _this.record.id + "/problems/external_id/"
				+ external_id,
		contentType : 'application/rdf+xml',
		data : data
	}, function(contentType, data) {
		var rdf = _this.process_rdf(contentType, data);
		callback(rdf);
	});
};

SMART_CLIENT.prototype.NOTES_get = function(callback) {
	var _this = this;
	this.api_call( {
		method : 'GET',
		url : "/records/" + _this.record.id + "/notes/",
		data : {}
	}, function(contentType, data) {
		var rdf = _this.process_rdf(contentType, data);
		callback(rdf);
	});
};

SMART_CLIENT.prototype.NOTES_post = function(data, callback) {
	var _this = this;
	this.api_call( {
		method : 'POST',
		url : "/records/" + _this.record.id + "/notes/",
		contentType : 'application/rdf+xml',
		data : data
	}, function(contentType, data) {
		callback(data);
	});
};

SMART_CLIENT.prototype.NOTES_delete = function(note_uri, callback) {
	var _this = this;

	this.api_call( {
		method : 'DELETE',
		url : note_uri,
		data : {}
	}, function(contentType, data) {
		callback(data);
	});
};

SMART_CLIENT.prototype.NOTE_put = function(data, external_id, callback) {
	var _this = this;
	this.api_call( {
		method : 'PUT',
		url : "/records/" + _this.record.id + "/notes/external_id/"
				+ external_id,
		contentType : 'application/rdf+xml',
		data : data
	}, function(contentType, data) {
		var rdf = _this.process_rdf(contentType, data);
		callback(rdf);
	});
};


SMART_CLIENT.prototype.ALLERGIES_get = function(callback) {
	var _this = this;
	this.api_call( {
		method : 'GET',
		url : "/records/" + _this.record.id + "/allergies/",
		data : {}
	}, function(contentType, data) {
		var rdf = _this.process_rdf(contentType, data);
		callback(rdf);
	});
};

SMART_CLIENT.prototype.ALLERGIES_post = function(data, callback) {
	var _this = this;
	this.api_call( {
		method : 'POST',
		url : "/records/" + _this.record.id + "/allergies/",
		contentType : 'application/rdf+xml',
		data : data
	}, function(contentType, data) {
		callback(data);
	});
};

SMART_CLIENT.prototype.ALLERGIES_delete = function(allergy_uri, callback) {
	var _this = this;

	this.api_call( {
		method : 'DELETE',
		url : allergy_uri,
		data : {}
	}, function(contentType, data) {
		callback(data);
	});
};

SMART_CLIENT.prototype.ALLERGY_put = function(data, external_id, callback) {
	var _this = this;
	this.api_call( {
		method : 'PUT',
		url : "/records/" + _this.record.id + "/allergies/external_id/"
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
										"?platform  rdf:type  sp:Container")
								.where(
										"?platform   sp:capability ?cap");

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
					value : item.code
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
		url : "/records/" + _this.record.id + "/sparql",
		data : {
			q : query
		}
	}, function(contentType, data) {
		var rdf = _this.process_rdf(contentType, data);
		callback(rdf);
	});
};

SMART_CLIENT.prototype.createXMLDocument = function(string) {
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
			resources[s.value._string] = {uri: this.node_name(s)};

		if (resources[s.value._string][p.value._string] === undefined)
			resources[s.value._string][p.value._string] = [];
		
		if (p.value._string === "http://www.w3.org/1999/02/22-rdf-syntax-ns#type" )
		{
			if (resources[o.value._string] === undefined)
			{
				resources[o.value._string] = [];
				resources[o.value._string].uri = this.node_name(o);
			}
			
			resources[o.value._string].push(resources[s.value._string]);
		}

		if (o.type !== "literal" && resources[o.value._string] === undefined )
			resources[o.value._string] = {uri: this.node_name(o)};

		if (t.o.type === "literal")
			resources[s.value._string][p.value._string].push(o.value);
		else if (p.value._string !== "http://www.w3.org/1999/02/22-rdf-syntax-ns#type" )
			resources[s.value._string][p.value._string].push(resources[o.value._string]);
		else // avoid circular structures to maintain JSON.stringify-ability.
			resources[s.value._string][p.value._string].push(o.value._string);
		
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

		rdf.load(d, {});
		// Load all the namespaces from the xml+rdf into jquery.rdf
	var r = d.childNodes[0];
	if (r.nodeName !== "RDF" && r.nodeName !== "rdf:RDF")
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

	// abstract method to instantiate a list of objects from the rdf store.
	var _this = this;
	rdf.to_json = function() {
		return _this.to_json(rdf);
	};
	rdf.source_xml = data;
	return rdf;
}


var loadDependencies = function(callback) {
	
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


	var need_jschannel = function() {
		try {
			return (typeof (Channel.build) !== "function");
		} catch (e) {
			return true;
		}
	};

	need_jschannel.url = "http://sandbox.smartplatforms.org/static/smart_ui_server/resources/jschannel.js";

	var funcs = [ need_jquery, need_ui, need_rdf, need_jschannel ];

	for ( var i = 0; i < funcs.length; i++)
		if (funcs[i]())
			filenames.push(funcs[i]);

	load(filenames);
};
};

  
SMART_frame_glue_app = function(redirect_url) {	
   if (redirect_url === undefined)
       redirect_url = "index.html";

   window.onload = function() {
       document.body.innerHTML = '<img id="loading" src="http://sample-apps.smartplatforms.org/framework/smart/images/ajax-loader.gif">';
   };

   var check_loaded_handler = function(iframe_to_load) {
	   var dom = iframe_to_load.data("finished_dom");
	   var api_page= iframe_to_load.data("loaded_api_page");
	      if (api_page === true)
	    	  return;
	   
		  if (dom === false )
		  {
		   $("body").prepend("<B>SMArt App Loading Error</b>: 30 seconds passed, and app DOM failed to load:  <br>" + iframe_to_load.attr("src"));
		  }
		  else
		  {
		   $("body").prepend("<B>SMArt App Loading Error</b>: 30 seconds passed, and app DOM loaded, but never loaded smart-api-page.js");
		  }	
   }
   
   SMART = new SMART_CLIENT(null, window.top);
   SMART.message_receivers = {foreground: function() {
	   var src = $('#content').get(0).src;
	   $('#content').get(0).src = src;
       }};

   SMART.send_ready_message(function(context_info) {
	   $("html").css("overflow","hidden");
	   $("body").css("margin","0px");
	   $(window).resize(function() {
		  	var elt =$("#content");
		  	elt.css("height",$(window).height());
		  	elt.css("width",$(window).width());
		  	elt.show();
		  });

	   redirect_url += "?cookie_name="+SMART.cookie_name;
	   var content_iframe = $('<iframe src="'+redirect_url+'" id="content" style="border: 0px; overflow-x: hidden; overflow-y: auto;">');
	   $('body').append(content_iframe);
	   content_iframe.hide();
	   content_iframe.data("finished_dom", false);
	   content_iframe.data("loaded_api_page", false);
	   
	   setTimeout(function(){check_loaded_handler(content_iframe)},30000);
	   
	   content_iframe.load(function() {
 		    content_iframe.data("finished_dom", true);
			$('#loading').remove();
			$("html", content_iframe.get(0).contentDocument).css("overflow-x","hidden");
			$(window).resize();  
			content_iframe.show();
	   });
   });
};

SMART_frame_glue_app(window.SMART_redirect_url);

SMART_frame_glue_page = function(callback) {
	$('#content').data("loaded_api_page", true);
	$('#content').get(0).contentWindow.SMART = SMART;
	if (typeof callback === "function")	
		callback();
};