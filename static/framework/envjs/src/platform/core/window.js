/**
 * Makes an object window-like by proxying object accessors
 * @param {Object} scope
 * @param {Object} parent
 */
Envjs.proxy = function(scope, parent, aliasList){
    return (function(){return this;})();
};

Envjs.javaEnabled = false;

Envjs.homedir        = '';
Envjs.tmpdir         = '';
Envjs.os_name        = '';
Envjs.os_arch        = '';
Envjs.os_version     = '';
Envjs.lang           = '';
Envjs.platform       = '';

//some common user agents as constants so you can emulate them
Envjs.userAgents = {
	firefox3: 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.9.0.7) Gecko/2009021910 Firefox/3.0.7'
}

var __windows__ = {};

Envjs.windows = function(uuid, scope){
	var w;
	if(arguments.length === 0){
		/*for(w in __windows__){
			console.log('window uuid => %s', w);
			console.log('window document => %s', __windows__[w].document.baseURI);
		}*/
		return __windows__;
	}else if(arguments.length === 1){
		return (uuid in __windows__) ? __windows__[uuid] : null
	}else if(arguments.length === 2){
		__windows__[uuid] = scope;
		if(scope === null){
            delete __windows__[uuid];
		}
	}
};
/**
 *
 * @param {Object} frameElement
 * @param {Object} url
 */
Envjs.loadFrame = function(frame, url){	
    try {
        //console.log('loading frame %s', url);
        if(frame.contentWindow && frame.contentWindow.close){
            //mark for garbage collection
            frame.contentWindow.close();
        }

        //create a new scope for the window proxy
        //platforms will need to override this function
        //to make sure the scope is global-like
        frame.contentWindow = Envjs.proxy({});
		//console.log("frame.ownerDocument %s subframe %s", 
		//	frame.ownerDocument.location,
		//	frame.ownerDocument.__ownerFrame__);
		if(frame.ownerDocument&&frame.ownerDocument.__ownerFrame__){
			//console.log('frame is parent %s', frame.ownerDocument.__ownerFrame__.contentWindow.guid);
			new Window(frame.contentWindow, frame.ownerDocument.__ownerFrame__.contentWindow);
		}else{
			//console.log("window is parent %s", window.guid);
			new Window(frame.contentWindow, window);
		}

        //I dont think frames load asynchronously in firefox
        //and I think the tests have verified this but for
        //some reason I'm less than confident... Are there cases?
        frame.contentDocument = frame.contentWindow.document;
        frame.contentDocument.async = false;
        frame.contentDocument.__ownerFrame__ = frame;
        if(url){
            //console.log('envjs.loadFrame async %s', frame.contentDocument.async);
            frame.contentDocument.location.assign(Envjs.uri(url, frame.ownerDocument.location.toString()));
        }
    } catch(e) {
        console.log("failed to load frame content: from %s %s", url, e);
    }
};


/**
 * unloadFrame
 * @param {Object} frame
 */
Envjs.unloadFrame = function(frame){
    var all, length, i;
    try{
        //TODO: probably self-referencing structures within a document tree
        //preventing it from being entirely garbage collected once orphaned.
        //Should have code to walk tree and break all links between contained
        //objects.
        frame.contentDocument = null;
        if(frame.contentWindow){
			//console.log('closing window %s', frame.contentWindow);
            frame.contentWindow.close();
        }
        Envjs.gc();
    }catch(e){
        console.log(e);
    }
};

/**
 * Platform clean up hook if it ever makes sense - see Envjs.unloadFrame for example
 */
Envjs.gc = function(){};