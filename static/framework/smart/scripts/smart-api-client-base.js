/*
 * SMART API client
 * Josh Mandel
 * Ben Adida
 * Nikolai Schwertner
*/

var SMART_CONNECT_CLIENT = function(smart_server_origin, frame) {

    var is_ready = false,
    has_failed = false,
    debug = false,
    channel = null,
    timeoutProtect;

    var _this = sc = this;

    this.jQuery = this.$ = jQuery;

    if (top === self) { 
        has_failed = true;
        if (this.fail_callback) this.fail_callback();
    }

    this.ready = function(callback) {
        this.ready_callback = callback;
        if (is_ready) this.ready_callback();
        return this;
    };

    this.fail = function(callback) {
        this.fail_callback = callback;
        if (has_failed) {
            if (timeoutProtect) {
                clearTimeout(timeoutProtect);
            }
            this.fail_callback();
        }
        return this;
    };

    timeoutProtect = setTimeout(function() {
        timeoutProtect = null;
        has_failed = true;
        if (_this.fail_callback) _this.fail_callback();
    }, 5000);

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

    if (!has_failed) {
        if (window.addEventListener) window.addEventListener('message', procureChannel, false);
        else if(window.attachEvent) window.attachEvent('onmessage', procureChannel);
        window.parent.postMessage('"procure_channel"', "*");
    }


    this.received_setup = function(message) {
        this.context = message.context;
        this.uuid = message.uuid;
        this.credentials = message.credentials;
        this.manifest = message.manifest;

        this.user = message.context.user;
        this.record = message.context.record;


        this.ready_data = message.ready_data;

        is_ready = true;

        if (this.manifest.mode == "ui" || this.manifest.mode == "frame_ui")
            this.assign_ui_handlers();

        if (this.manifest.mode == "frame_ui")
            this.assign_frame_ui_handlers();

        if (timeoutProtect) {
            clearTimeout(timeoutProtect);
        }

        if (this.ready_callback) this.ready_callback();
    };

    this.assign_ui_handlers = function() {
        this.api_call = function(options, callback_success, callback_error) {
            var dfd = $.Deferred(),
            prm = dfd.promise();
            prm.success = prm.done;
            prm.error = prm.fail;
            if (callback_success) {
                prm.success(callback_success);
                if (callback_error) prm.error(callback_error);
            }
            if (options.success) prm.success(options.success);
            if (options.error) prm.error(options.error);
            channel.call({method: "api_call",
                         params: 
                             {
                             'func' : options.url,
                             'method' : options.method,
                             'params' : options.data,
                             'contentType' : options.contentType || "application/x-www-form-urlencoded"
                         },
                         success: function(r) { dfd.resolve({body: r.data, contentType: r.contentType}); },
                         error: function(e,m) { dfd.reject({status: e, message: m}); }
            });
            return prm;
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

        // renamed from this.return because IE8 refuses to allow reserved words 
        // (this.return is no good; this['return'] would work)
        this.complete = function(returndata) {

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

        this.PATIENTS_get = function(callback_success, callback_error) {
            var dfd = $.Deferred(),
            prm = dfd.promise();
            prm.success = prm.done;
            prm.error = prm.fail;
            if (callback_success) {
                prm.success(callback_success);
                if (callback_error) prm.error(callback_error);
            }
            sc.api_call({
                url: "/records/search",
                method: "GET"
            }, function(r) {
                var rdf,
                json;
                try {
                    rdf = _this.process_rdf(r.contentType, r.body);
                } catch(err) {
                    try {
                        json = JSON.parse(r.body);
                    } catch(err) {}
                }
                dfd.resolve({body: r.body, contentType: r.contentType, graph: rdf, json: json});
            }, function(r) {
                dfd.reject({status: r.status, message: r.message});
            });
            return prm;
        };

    }
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

SMART_CONNECT_CLIENT.prototype.merge_graphs = function() {
    //add all graphs in arguments to new rdfquery object
    var rq = $.rdf();

    $.each(arguments, function() {
            rq.databank = rq.databank.add(
                this.databank, 
                { namespaces: this.prefix() });
            });

    return rq;
};


SMART_CONNECT_CLIENT.prototype.process_rdf = function(contentType, data) {
    try {
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
                if (match && match.length == 2) {
                    rdf.prefix(match[1], a.nodeValue);
                }
            } catch (err) {}
        }

        rdf.prefix("sp", "http://smartplatforms.org/terms#");
        rdf.prefix("dcterms", "http://purl.org/dc/terms/");
        rdf.prefix("foaf","http://xmlns.com/foaf/0.1/");
        rdf.prefix("v","http://www.w3.org/2006/vcard/ns#");

        return rdf;
    } catch(err) {
        return;
    }
}

SMART_CONNECT_CLIENT.prototype.objectify = function(rdf) {

    var ret = { };
    var graph = ret['@graph'] = rdf.databank.dump();    
    var context = ret['@context'] = this.jsonld_context;
    var of_type = ret['of_type'] = {};

    var get_jsonld_property = function(p) {

        if (!get_jsonld_property.cxt) {

            var cxt = get_jsonld_property.cxt = {
                'http://www.w3.org/1999/02/22-rdf-syntax-ns#type': {
                    name: '@type',
                    multiple_cardinality: true,
                    is_id: true
                }
            };

            $.each(context, function(k, v){
                cxt[v['@id']] = {
                    name: k,
                    multiple_cardinality: (v['@container'] && v['@container'] === '@set'),
                    is_id: (v['@type'] && v['@type'] === '@id')
                }
            });
        }

        return  get_jsonld_property.cxt[p];
    };

    // 1. Compactify URIs
    $.each(graph, function(subject, json_subject){
        $.each(json_subject, function(property, values){
            var jsld_property = get_jsonld_property(property);

            if (!jsld_property){
                return;
            }

            if (jsld_property.name !== property) {
                json_subject[jsld_property.name] = json_subject[property];
                delete json_subject[property];
            }

            if (jsld_property.is_id) {
                var to_replace = json_subject[jsld_property.name];
                for (var i=0; i < to_replace.length; i++) {
                    var shorter_value = get_jsonld_property(to_replace[i].value) || {
                        name: to_replace[i].value
                    };
                    to_replace[i] = shorter_value.name;
                }
            }

            if (!jsld_property.multiple_cardinality) {
                var arr =json_subject[jsld_property.name]
                if (arr.length > 1) {
                    throw "Found multiple objects for " + jsld_property.name;
                }
                if (arr.length === 1) {
                    json_subject[jsld_property.name] = arr[0];
                }
            }
        });
    });

    // 2. Link up objects and json-ld-ify values
    $.each(graph, function(subject, json_subject){
        json_subject['@id'] = subject;

        $.each(json_subject, function(property, values){

            var made_array = false;
            if (!$.isArray(values)) {
                values = [values];
                made_array = true;
            }

            for (var i = 0; i < values.length; i++) {
                var v = values[i];
                if ((v.type === 'uri' || v.type === 'bnode') && graph[v.value]) {
                    values[i] = graph[v.value];
                } else if (v.type === 'uri' || v.type === 'bnode') {
                    values[i] = {"@id": v.value};
                } else if (v.type === 'literal') {
                    if (!(v.lang || v.datatype)) {
                        values[i] = v.value;
                    } else if (v.datatype === "http://www.w3.org/2001/XMLSchema#integer") {
                      values[i] = Number(v.value);
                    } else {
                        values[i] = {
                            "@value": v.value,
                            "@type": v.datatype,
                            "@language": v.lang
                        };
                    }
                }
            };

            if (made_array) {
                json_subject[property] = values[0];
            }

        });
    });

    $.each(graph, function(subject, json_subject){
        if (!json_subject['@type']) {
            return;
        }
        $.each(json_subject['@type'], function(i, type) {
            var tl = of_type[type] = of_type[type] || [];
            tl.push(json_subject);
        });
    });     

    return ret;
}

SMART_CONNECT_CLIENT.prototype.api_call_wrapper = function(o) {
    var _this = this,
    dfd = $.Deferred(),
    prm = dfd.promise();

    prm.success = prm.done;
    prm.error = prm.fail;

    var urlVars = {
      record_id: this.record.id,
      user_id: this.user.id,
      smart_app_id: this.manifest.id
    };

    $.extend(urlVars, o.parameters);

    var requiredUrlParams = o.path.match(/{.*?}/g) || [];
    $.each(requiredUrlParams, function(i,v){
      o.path = o.path.replace(v, urlVars[v.slice(1,-1)]); 
    });

    var unmetParams = [];
    $.each(o.queryParams, function(k,v){
      if (o.parameters[k] !== undefined) {
        o.queryParams[k] = o.parameters[k];
      } else {
        unmetParams.push(k);
      }
    });

    $.each(unmetParams, function(i,k){
      delete o.queryParams[k];
    });

    var times = [];
    times.push(["initial call", new Date().getTime()]);

    this.api_call({
        method: o.method,
        url: o.path,
        data: o.parameters.data || o.queryParams,
        contentType: o.parameters.contentType
        }, 
        function(r) {
        times.push(["SmartResponse received", new Date().getTime()]);
        var ret = {status: r.status, body: r.body, contentType: r.contentType};

        if (r.contentType === "application/rdf+xml") {
            var rdf;
            try {
                rdf = _this.process_rdf(r.contentType, r.body);
                ret.objects = _this.objectify(rdf);
                times.push(["objectified", new Date().getTime()]);
                ret.graph = rdf;
            } catch(err) { dfd.reject({status: r.status, message: err}); }

        } else if (r.contentType === "application/json") {
            try {
                json = JSON.parse(r.body);
                times.push(["json parsed", new Date().getTime()]);
                ret.json = json;
            } catch(err) {
                dfd.reject({status: r.status, message: err});
            }
        } 

        dfd.resolve(ret);

        if (SMART.debug) {
            for (var i = 0; i < times.length; i++) {
                console.log(times[i][0] + ": " + (times[i][1] - times[0][1] + " ms elapsed."));
            }
        }
    }, function(r) {
        dfd.reject({status: r.status, message: r.message});
    });
    return prm;
};

/* Temporary static convenience method until we fix the ontology */
/* NJS 2012-07-25: Disabled, because it conflicts with the new contaner manifest get method */
/*
SMART_CONNECT_CLIENT.prototype.MANIFEST_get = function(descriptor, callback_success, callback_error) {
    var _this = this,
        dfd = $.Deferred(),
        prm = dfd.promise();
    prm.success = prm.done;
    prm.error = prm.fail;
    if (callback_success) {
       prm.success(callback_success);
       if (callback_error) prm.error(callback_error);
    }
    this.api_call({
        method: 'GET',
        url: "/apps/" + descriptor + "/manifest"
    }, function(r) {
        var json;
        try {
            json = JSON.parse(r.body);
        } catch(err) {}
        dfd.resolve({body: r.body, contentType: r.contentType, json: json});
    }, function(r) {
        dfd.reject({status: r.status, message: r.message});
    });
    return prm;
};
*/
