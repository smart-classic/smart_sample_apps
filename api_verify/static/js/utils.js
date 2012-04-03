// SMART API Verifier library of service methods
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
                    temp = {},
                    SP = "http://smartplatforms.org/terms#",
                    target,
                    m,
                    i;
                
                // Copy the API calls as appropriate into temp
                for (target in data) {
                    if (version === "0.3") {
                        // For version 0.3 of SMART copy only the specific calls below
                        if (target === SP + "Allergy" ||
                            target === SP + "Demographics" ||
                            target === SP + "Fulfillment" ||
                            target === SP + "LabResult" ||
                            target === SP + "Medication" ||
                            target === SP + "Problem" ||
                            target === SP + "VitalSigns") {
                                temp[target] = data[target];
                        }
                    } else {
                        // Copy everything
                        temp[target] = data[target];
                    }
                }
                
                // Update data to point at temp
                data = temp;
                
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
                
                // Process the response messages
                VERIFY.processResults(call_name, response.messages);
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
                // Run the tests on the server side over the call response data
                VERIFY.testModel (call_name,
                                  model,
                                  response.body,
                                  response.contentType,
                                  VERIFY.processResults);
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
    
    /**
    * Validates custom SMART data and displays the result
    */
    VERIFY.validateCustomData = function () {
    
        var contentType,
            model = $('#model').val(),
            data = $('#rdf_input').val();
        
        // Disable the validate button
        $('#validate').button('disable');
        $('#custom_messages').hide();
        $('#spinner').show();
        
        // Auto-select the content type based on the model
        if (model === "AppManifest" || model === "Container") {
            contentType = "application/json";
        } else if (model === "UserPreferences") {
            contentType = "text/plain";
        } else {
            contentType = "application/rdf+xml";
        }
        
        // Ajax call to the server
        $.post(
            "runtests",
            {'model': model, 'data': data, 'content_type': contentType},
            function (responseText) {
                var messages = JSON.parse (responseText),
                    console_text = "";
                
                for (var i = 0; i < messages.length; i++) {
                    console_text += messages[i] + "\n";
                }
                
                // Default message
                if (messages.length === 0) {
                    console_text = "No problems detected (model = '" + model + "')";
                }

                // Hack to convert the line endings to \r when IE is used
                if (VERIFY.getInternetExplorerVersion() > 0) {
                    console_text = console_text.replace(/\n/g, "\r");
                }

                // Refresh the console and show it if there is any text to display in it
                $('#custom_messages').text(console_text);
                $('#custom_messages').show();
                
                // Reset the validate button state
                $('#spinner').hide();
                $('#validate').button('enable');
            },
            "html"
        );
    };
    
    /**
    * Updates the queries description based on the model selected
    */
    VERIFY.updateQueries = function () {
        var model = $('#model2').val();
        
        if (model.length == 0) {
            $('#queries_label').hide();
            $('#spinner2').hide();
            $('#queries').hide();
            return;
        }
        
        
        $('#queries').hide();
        $('#queries_label').show();
        $('#spinner2').show();
        
        // Ajax call to the server
        $.get(
            "describe",
            {'model': model},
            function (responseText) {
                // Hack to convert the line endings to \r when IE is used
                if (VERIFY.getInternetExplorerVersion() > 0) {
                    responseText = responseText.replace(/\n/g, "\r");
                }
                
                // Hide the spinner
                $('#spinner2').hide();

                // Refresh the console and show it if there is any text to display in it
                $('#queries').text(responseText);
                $('#queries').show();
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
                // We have a special error message indicating that the RDF did not contain any tripples
                empty = true;
            } else {
                // Add the short message to the hover label text
                label += short_message + "<br/>";
                
                // Add the message to the console text
                VERIFY.console_text += "In " + call_name + ": ";
                VERIFY.console_text += messages[i] + "\n";
            }
        }
        
        // When there are error messages, set the API icon to warning and display a mouse over dialog
        if (messages.length > 0 && !empty) {
            
            $('#'+call_name).html("<img id='anchor-dlg" + call_name + "' class='js_mouseyDialog two' src='/static/images/warn.gif'/><div id='dlg" + call_name + "' style='display:none'>" + label + "</div>");
            $('.two').mouseyDialog({
              eventType:'hover',
              animation:'fade',
              animationSpeed:200
            });
        } else if (empty) {
            // We got the empty RDF message, so display the NA icon
            $('#'+call_name).html("<img src='/static/images/na.gif'/>");
        } else {
            // No error messages, so display the OK icon
            $('#'+call_name).html("<img src='/static/images/ok.gif'/>");
        }

        // Hack to convert the line endings to \r when IE is used
        if (VERIFY.getInternetExplorerVersion() > 0) {
            VERIFY.console_text = VERIFY.console_text.replace(/\n/g, "\r");
        }

        // Refresh the console and show it if there is any text to display in it
        if (VERIFY.console_text.length > 0) {
            $('#all_messages').text(VERIFY.console_text);
            $('#all_messages').show();
        }
    };

    /**
    * Sets the icon representing an API call to error state
    */
    VERIFY.callbackError = function(call_name) {
        $('#'+call_name).html("<img src='/static/images/err.gif'/>");
    };
    
    // Returns the version of IE used as decimal (i.e. 9.1)
    VERIFY.getInternetExplorerVersion = function () {
        var rv = -1; // Return value if not IE
        if (navigator.appName == 'Microsoft Internet Explorer') {
            var ua = navigator.userAgent;
            var re  = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
            if (re.exec(ua) != null) rv = parseFloat( RegExp.$1 );
        }
        return rv;
    };
    
    // Call this method once VERIFY.loadCalls() is done to get the test results table displayed and
    // the testing process started
    VERIFY.initializeApp = function () {
        // First construct and output a placeholder table for all the calls and icons
        // with the icon defaulting to busy state. Then, execute the api call tests.

        // Local variables
        var table_str,
            smart_model,
            call_py,
            call_js,
            call,
            model,
            options_str = "",
            SP = "http://smartplatforms.org/terms#";
        
        // Table header
        table_str = "<table class='nicetable'>";
        table_str += "<thead><tr><th>DataModel</th><th>JS</th><th>REST</th></tr></thead><tbody>";
        
        // Table body (and options string)
        for (model in VERIFY.calls) {
            call_py = VERIFY.calls[model].call_py;
            call_js = VERIFY.calls[model].call_js;
            table_str += "<tr><td>"+model.replace(SP,"")+"</td><td align='center' id='"+call_js+"'><img src='/static/images/ajax-loader.gif'/></td><td align='center' id='"+call_py+"'><img src='/static/images/ajax-loader.gif'/></td></tr>";
            options_str += "<option>" + model.replace(SP,"") + "</option>\n";
        }
        
        // Table footer
        table_str += "</tbody></table>";
        
        // Output the table and options
        $('#results').html(table_str);
        $('#model').html(options_str);
        
        // Output the queries descriptor model options
        options_str = "<option></option>\n" + options_str;
        $('#model2').html(options_str);
        
        // Enable the validate button
        $('#validate').button('enable');
        
        // With all the API calls
        for (model in VERIFY.calls) {
        
            // Fetch the call name and the data model name
            call = VERIFY.calls[model];
            smart_model = model.replace(SP,"");
            
            // Run the api call tests on both the Python and JS interfaces
            VERIFY.callREST(call.call_py);
            VERIFY.callJS(call.call_js, smart_model);
        }
            
    };
    
}());