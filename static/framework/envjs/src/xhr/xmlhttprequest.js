
/**
 *
 * @class XMLHttpRequest
 * @author Originally implemented by Yehuda Katz
 *
 */

// this implementation can be used without requiring a DOMParser
// assuming you dont try to use it to get xml/html documents
var domparser;

XMLHttpRequest = function(){
    this.headers = {};
    this.responseHeaders = {};
    this.aborted = false;//non-standard
};

// defined by the standard: http://www.w3.org/TR/XMLHttpRequest/#xmlhttprequest
// but not provided by Firefox.  Safari and others do define it.
XMLHttpRequest.UNSENT = 0;
XMLHttpRequest.OPEN = 1;
XMLHttpRequest.HEADERS_RECEIVED = 2;
XMLHttpRequest.LOADING = 3;
XMLHttpRequest.DONE = 4;

XMLHttpRequest.prototype = {
    open: function(method, url, async, user, password){
        //console.log('openning xhr %s %s %s', method, url, async);
        this.readyState = 1;
        this.async = (async === false)?false:true;
        this.method = method || "GET";
        this.url = Envjs.uri(url);
        this.onreadystatechange();
    },
    setRequestHeader: function(header, value){
        this.headers[header] = value;
    },
    send: function(data, parsedoc/*non-standard*/, redirect_count){
        var _this = this;
		//console.log('sending request for url %s', this.url);
        parsedoc = (parsedoc === undefined)?true:!!parsedoc;
        redirect_count = (redirect_count === undefined) ? 0 : redirect_count;
        function makeRequest(){
            var cookie = Envjs.getCookies(_this.url),
				redirecting = false;
            if(cookie){
                _this.setRequestHeader('COOKIE', cookie);
            }
			if(window&&window.navigator&&window.navigator.userAgent)
	        	_this.setRequestHeader('User-Agent', window.navigator.userAgent);
            Envjs.connection(_this, function(){
                if (!_this.aborted){
                    var doc = null,
                        domparser,
                        cookie;
                    
                    try{
                        cookie = _this.getResponseHeader('SET-COOKIE');
                        if(cookie){
                            Envjs.setCookie(_this.url, cookie);
                        }
                    }catch(e){
                        console.warn("Failed to set cookie");
                    }
                    //console.log('status : %s', _this.status);
					switch(_this.status){
						case 301:
						case 302:
						case 303:
						case 305:
						case 307:
						if(_this.getResponseHeader('Location') && redirect_count < 20){
							//follow redirect and copy headers
							redirecting = true;
							//console.log('following %s redirect %s from %s url %s', 
							//	redirect_count, _this.status, _this.url, _this.getResponseHeader('Location'));
	                        _this.url = Envjs.uri(_this.getResponseHeader('Location'));
	                        //remove current cookie headers to allow the redirect to determine
	                        //the currect cookie based on the new location
	                        if('Cookie' in _this.headers ){
	                            delete _this.headers.Cookie;
	                        }
	                        if('Cookie2' in _this.headers ){
	                            delete _this.headers.Cookie2;
	                        }
							redirect_count++;
							if (_this.async){
					            //TODO: see TODO notes below
					            Envjs.runAsync(makeRequest);
					        }else{
					            makeRequest();
					        }
							return;
						}break;
						default:
						// try to parse the document if we havent explicitly set a
                        // flag saying not to and if we can assure the text at least
                        // starts with valid xml
                        if ( parsedoc && 
                            _this.getResponseHeader('Content-Type').indexOf('xml') > -1 &&
                            _this.responseText.match(/^\s*</) ) {
                            domparser = domparser||new DOMParser();
                            try {
                                //console.log("parsing response text into xml document");
                                doc = domparser.parseFromString(_this.responseText+"", 'text/xml');
                            } catch(e) {
                                //Envjs.error('response XML does not appear to be well formed xml', e);
                                console.warn('parseerror \n%s', e);
                                doc = document.implementation.createDocument('','error',null);
                                doc.appendChild(doc.createTextNode(e+''));
                            }
                        }else{
                            //Envjs.warn('response XML does not appear to be xml');
                        }

                        _this.__defineGetter__("responseXML", function(){
                            return doc;
                        });
							
					}
                }
            }, data);

            if (!_this.aborted  && !redirecting){
				//console.log('did not abort so call onreadystatechange');
                _this.onreadystatechange();
            }
        }

        if (this.async){
            //TODO: what we really need to do here is rejoin the
            //      current thread and call onreadystatechange via
            //      setTimeout so the callback is essentially applied
            //      at the end of the current callstack
            //console.log('requesting async: %s', this.url);
            Envjs.runAsync(makeRequest);
        }else{
            //console.log('requesting sync: %s', this.url);
            makeRequest();
        }
    },
    abort: function(){
        this.aborted = true;
    },
    onreadystatechange: function(){
        //Instance specific
    },
    getResponseHeader: function(header){
        //$debug('GETTING RESPONSE HEADER '+header);
        var rHeader, returnedHeaders;
        if (this.readyState < 3){
            throw new Error("INVALID_STATE_ERR");
        } else {
            returnedHeaders = [];
            for (rHeader in this.responseHeaders) {
                if (rHeader.match(new RegExp(header, "i"))) {
                    returnedHeaders.push(this.responseHeaders[rHeader]);
                }
            }

            if (returnedHeaders.length){
                //$debug('GOT RESPONSE HEADER '+returnedHeaders.join(", "));
                return returnedHeaders.join(", ");
            }
        }
        return null;
    },
    getAllResponseHeaders: function(){
        var header, returnedHeaders = [];
        if (this.readyState < 3){
            throw new Error("INVALID_STATE_ERR");
        } else {
            for (header in this.responseHeaders) {
                returnedHeaders.push( header + ": " + this.responseHeaders[header] );
            }
        }
        return returnedHeaders.join("\r\n");
    },
    async: true,
    readyState: 0,
    responseText: "",
    status: 0,
    statusText: ""
};
