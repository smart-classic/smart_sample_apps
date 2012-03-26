// SMART API Verifier library with asynchronous Ajax call wrappers
//
// Author: Nikolai Schwertner
//
// Revision history:
//     2012-02-24 Initial release

// Intialize the VERIFY global object as needed
var VERIFY;
if (!VERIFY) {
    VERIFY = {
        calls: []
    };
}

(function () {
    "use strict";
    
    /**
    * Loads the SMART API calls matrix into the global object
    */
    VERIFY.loadCalls = function (version) {
        var dfd = $.Deferred();
        
        $.get(
            "getcalls",
            {'oauth_header': SMART.credentials.oauth_header},
            function (responseText) {
                
                // Local variables
                var data = JSON.parse(responseText),
                    data2 = {},
                    SP = "http://smartplatforms.org/terms#",
                    target,
                    m,
                    i;
                
                // Copy the API calls as appropriate into data2
                for (target in data) {
                    if (version === "v0.3") {
                        // For version 0.3 of SMART copy only the specific calls below
                        if (target === SP + "Allergy" ||
                            target === SP + "Demographics" ||
                            target === SP + "Fulfillment" ||
                            target === SP + "LabResult" ||
                            target === SP + "Medication" ||
                            target === SP + "Problem" ||
                            target === SP + "VitalSigns") {
                                data2[target] = data[target];
                        }
                    } else {
                        // Copy everything
                        data2[target] = data[target];
                    }
                }
                
                // Update data to point at data2
                data = data2;
                
                // Get the SMART connect client methods registry
                m = SMART.methods;
                
                // Match the methods from the SMART connect client against the
                // python library methods and update the data object as appropriate
                for (i = 0; i < m.length; i++) {
                    if (m[i].method === "GET" && 
                        (m[i].category === "record_items" ||
                         m[i].name === "MANIFESTS_get" ||
                         m[i].name === "ONTOLOGY_get" ||
                         m[i].name === "CAPABILITIES_get")) {
                        if (data[m[i].target]) data[m[i].target].call_js = m[i].name;
                    }
                }
                
                // Update the global VERIFY object and resolve the differed object
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
    
    /**
    * Tests a SMART REST API call
    */
    VERIFY.callREST = function (call_name) {
        $.post(
            "apicall",
            {'call_name': call_name, 'oauth_header': SMART.credentials.oauth_header},
            function (responseText) {
            
                // Parse the response from the server REST call handler
                var response = JSON.parse (responseText);
                
                if (response.contentType !== "text/html") {
                    // We can go straight to processing the test results, since the SMART REST
                    // call handler on the server side also runs the applicable tests (i.e.
                    // the test results are included in the response)
                    VERIFY.processResults(call_name, response.messages);
                } else {
                    // Assume that "text/html" response content type means API failure (needs to be revisited)
                    VERIFY.callbackError (call_name);
                }
            },
            "html"
        ).error(function () {
            VERIFY.callbackError(call_name);
        });
    };
    
    /**
    * Tests a SMART Connect API call
    */
    VERIFY.callJS = function (call_name, model) {
        SMART[call_name](
            function(response) {
                if (response.contentType === "text/html") {
                    // Assume that "text/html" response content type means API failure (needs to be revisited)
                    VERIFY.callbackError (call_name);
                } else {
                    // Run the tests on the server side over the call response data
                    VERIFY.testModel (call_name,
                                      model,
                                      response.body,
                                      response.contentType,
                                      VERIFY.processResults);
                }
            }, function () {
                VERIFY.callbackError (call_name);
            });
    };
    
    /**
    * Parses the SMART ontology returned by the SMART container in the browser
    * and returns the list of API calls discovered
    */
    VERIFY.getCalls = function () {
        SMART.ONTOLOGY_get().success(function(r) {
        
            var ont = r.graph,
                calls = [];

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
    
    /**
    * Tests a SMART API call's response on the server side and executes
    * a callback to process the test results
    */
    VERIFY.testModel = function (call, model, data, contentType, callback) {
        $.post(
            "runtests",
            {'model': model, 'data': data, 'content_type': contentType},
            function (responseText) {
                var response = JSON.parse (responseText);
                callback (call, response);
            },
            "html"
        );
    };
    
    // Initialize the console text storage
    VERIFY.console_text = "";
    
    /**
    * Processes the tests results for a specific API call
    */
    VERIFY.processResults = function (call_name, messages) {
    
        // Label text to be displayed in the mouse over dialog for the API icon
        var label = "",
            short_message,
            empty = false;
        
        // For each error message
        for (var i = 0; i < messages.length; i++) {
            // Add the first line of the error message to the label
            short_message = messages[i].split("\n")[0];
            
            if (short_message.search("EMPTY RESULT SET") > -1) {
                empty = true;
            } else {
                label += short_message + "<br/>";
                
                // Add the message to the console text
                VERIFY.console_text += "In " + call_name + ": ";
                VERIFY.console_text += messages[i] + "\n";
            }
        }
        
        if (messages.length > 0 && !empty) {
            // When there are error messages, set the API icon to warning and display a mouse over dialog
            $('#'+call_name).html("<img id='anchor-dlg" + call_name + "' class='js_mouseyDialog two' src='/static/images/warn.gif'/><div id='dlg" + call_name + "' style='display:none'>" + label + "</div>");
            $('.two').mouseyDialog({
              eventType:'hover',
              animation:'fade',
              animationSpeed:200
            });
        } else if (empty) {
            $('#'+call_name).html("<img src='/static/images/na.gif'/>");
        } else {
            // No error messages, so display the OK icon
            $('#'+call_name).html("<img src='/static/images/ok.gif'/>");
        }
        
        // Update the console
        $('#JashInput').text(VERIFY.console_text);
    };

    /**
    * Sets the icon representing an API call to error state
    */
    VERIFY.callbackError = function(call_name) {
        $('#'+call_name).html("<img src='/static/images/err.gif'/>");
    };
}());