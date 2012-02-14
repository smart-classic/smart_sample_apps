// SMART Direct Library with asynchronous Ajax call wrappers
//
// Author: Nikolai Schwertner
//
// Revision history:
//     2011-10-04 Initial release

// Intialize the Direct App global object as needed
var VERIFY;
if (!VERIFY) {
    VERIFY = {
        calls: []
    };
}

(function () {
    "use strict";

    VERIFY.loadCalls = function () {
        var dfd = $.Deferred();
        $.get(
            "getcalls",
            {'oauth_header': SMART.credentials.oauth_header},
            function (responseText) {
                var data = JSON.parse(responseText);
                
                var m = SMART.methods;
                for (var i = 0; i < m.length; i++) {
                    if (m[i].method === "GET" && 
                        (m[i].category === "record_items" ||
                         m[i].name === "MANIFESTS_get" ||
                         m[i].name === "ONTOLOGY_get" ||
                         m[i].name === "CAPABILITIES_get")) {
                        data[m[i].target].call_js = m[i].name;
                    }
                }
                
                VERIFY.calls = data;
                dfd.resolve();
            },
            "html"
        ).error(function () {
            console.error("getCalls failed");
            dfd.reject();
        });
        return dfd.promise();
    };
    
    VERIFY.callREST = function (call, callback_failure) {
        var dfd = $.Deferred();
        $.get(
            "apicall",
            {'call_name': call, 'oauth_header': SMART.credentials.oauth_header},
            function (responseText) {
                var response = JSON.parse (responseText);
                if (response.contentType !== "text/html") {
                    VERIFY.callback_final(call, response.messages);
                } else {
                    callback_failure (call);
                }
                dfd.resolve();
            },
            "html"
        ).error(function () {
            callback_failure(call);
            dfd.reject();
        });
        return dfd.promise();
    };
    
    VERIFY.callJS = function (call, model, callback_ok, callback_failure) {
        var dfd = $.Deferred();
        
        SMART[call]().success(function(response) {
                if (response.contentType === "text/html") {
                    callback_failure (call);
                } else {
                    callback_ok(call, model, response);
                }
                dfd.resolve();
            });
            
        return dfd.promise();
    };
    
    VERIFY.getCalls = function () {
        SMART.ONTOLOGY_get().success(function(r) {
            var ont = r.graph;
			var calls = [];
			// Get all calls
			ont.where("?call rdf:type api:call")				
			   .where("?call api:path ?call_path")
			   .where("?call api:target ?call_target")
			   .where("?call api:category ?call_category")
			   .where("?call api:method \"GET\"")
               .each(function(){
                    if (this.call_category.value === "record_items" || 
                        this.call_path.value === "/ontology" ||
                        this.call_path.value === "/apps/manifests/" ||
                        this.call_path.value === "/capabilities/") {
                            calls.push({
                                path: this.call_path.value,
                                target: String(this.call_target.value),
                                category: this.call_category.value
                            });
                    }
				});		
			
			return calls;
        });

    };
    
    VERIFY.testModel = function (call, model, data, contentType, callback) {
        var dfd = $.Deferred();
        //alert (call + ":" + model + ":" + contentType + ":" + data);
        $.get(
            "runtests",
            {'model': model, 'data': data, 'content_type': contentType},
            function (responseText) {
                var response = JSON.parse (responseText);
                callback (call, response);
                dfd.resolve();
            },
            "html"
        );
        return dfd.promise();
    };
    
    var out2 = "";
    
    VERIFY.callback_final = function (call_name, messages) {
                                var out = "";
                                
                                for (var i = 0; i < messages.length; i++) {
                                    out += messages[i].split("\n")[0] + "<br/>";
                                    out2 += "In " + call_name + ": ";
                                    out2 += messages[i];
                                }
                                if (messages.length > 0) {
                                     $('#'+call_name).html("<img id='anchor-dlg" + call_name + "' class='js_mouseyDialog two' src='/static/images/warn.gif'/><div id='dlg" + call_name + "' style='display:none'>" + out + "</div>");
                                     $('.two').mouseyDialog({
                                      eventType:'hover',
                                      animation:'fade',
                                      animationSpeed:200
                                    });
                                } else {
                                    $('#'+call_name).html("<img src='/static/images/ok.gif'/>");
                                }
                                
                                $('#console').text(out2);
                            };
    
    VERIFY.callback_ok = function(call_name, call_model, response) {
        VERIFY.testModel (call_name,
                            call_model,
                            response.body,
                            response.contentType,
                            VERIFY.callback_final);
    };
}());