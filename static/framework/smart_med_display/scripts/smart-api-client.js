/*
 * SMArt API client
 *
 * randomUUID is included at the bottom from:
 * http://ajaxian.com/archives/uuid-generator-in-javascript
 * 
 * Josh Mandel
 * Ben Adida
 */



var SMART_CLIENT = Class.extend({
    init: function(smart_server_origin, frame) {
	this.smart_server_origin = smart_server_origin;
	this.frame = frame;
	
	this.active_calls = {};

	// register the message receiver
	// wrap in a function because of "this" binding
	var _this = this;
	window.addEventListener("message", function(message) {
	    _this.receive_message(message);
	}, false);
    },

    // a message received from the SMArt container
    receive_message: function(event) {
	// only listen for events from the SMArt container origin
	if (this.smart_server_origin != null && event.origin != this.smart_server_origin)
	    return;

	// parse message
	var parsed_message = JSON.parse(event.data);

	// setup message with credentials and initial data
	if (parsed_message.type == 'setup') {
	    // FIXME: for now we are binding this client when it receives the setup message.
	    // easier for development, may need some work
	    this.smart_server_origin = event.origin;	
	    this.receive_setup_message(parsed_message);
	}

	// api return
	if (parsed_message.type == 'apireturn') {
	    this.receive_apireturn_message(parsed_message);
	}
    },

    send_ready_message: function(ready_callback) {
	this.ready_callback = ready_callback;

	// FIXME: we are not setting a destination constraint here to make it easier to develop
	// but we may need to do that eventually... it's not clear
	this.frame.postMessage(JSON.stringify({'type': 'ready'}), '*');
    },

    receive_setup_message: function(message) {
	this.credentials = message.credentials;
	this.record_info = message.record_info;
	this.ready_callback(this.record_info);
    },

    receive_apireturn_message: function(message) {
	var callback = this.active_calls[message.uuid];
	
	if (callback == null) {
	    alert('no callback for ' + message.uuid);
	    return;
	}
	
	// unwrap the content-type
	callback(message.content_type, message.payload);

	// FIXME: we should parse payload XML and JSON here, depending on content type. 

	// clear out the callback
	this.active_calls[message.uuid] = null;
    },

    // generic api_call function
    // api calls have a function name and named variables
    // we have to track the calls because asynchronicity might
    // make the results come back in a different order
    api_call: function(func, params, callback) {
		var call_uuid = randomUUID();
		this.active_calls[call_uuid] = callback;
	
		this.frame.postMessage(JSON.stringify({
		    'type' : 'apicall',
		    'uuid' : call_uuid,
		    'func' : func,
		    'params' : params
			}), this.smart_server_origin);
		}
    });







/* randomUUID.js - Version 1.0
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
  // Make array of random hex digits. The UUID only has 32 digits in it, but we
  // allocate an extra items to make room for the '-'s we'll be inserting.
  for (var i = 0; i <36; i++) s[i] = Math.floor(Math.random()*0x10);
  // Conform to RFC-4122, section 4.4
  s[14] = 4;  // Set 4 high bits of time_high field to version
   s[19] = (s[19] & 0x3) | 0x8;  // Specify 2 high bits of clock sequence
  // Convert to hex chars
  for (var i = 0; i <36; i++) s[i] = itoh[s[i]];
  // Insert '-'s
  s[8] = s[13] = s[18] = s[23] = '-';
  return s.join('');
}
 

/**
 * end of randomUUID
 */


/*
SMART_CLIENT.prototype.MEDS = {
    get_all : function(callback) {
	this.api_call("meds.get_all", {}, callback);	
    },

    get_one : function(med_id, callback) {
	this.api_call("meds.get_one", {med_id : med_id}, callback);	
    }
};
*/