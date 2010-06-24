
//Since we're running in rhino I guess we can safely assume
//java is 'enabled'.  I'm sure this requires more thought
//than I've given it here
Envjs.javaEnabled = true;   

Envjs.tmpdir         = java.lang.System.getProperty("java.io.tmpdir"); 
Envjs.os_name        = java.lang.System.getProperty("os.name"); 
Envjs.os_arch        = java.lang.System.getProperty("os.arch"); 
Envjs.os_version     = java.lang.System.getProperty("os.version"); 
Envjs.lang           = java.lang.System.getProperty("user.lang"); 
    

/**
 * 
 * @param {Object} frameElement
 * @param {Object} url
 */
Envjs.loadFrame = function(frame, url){
    try {
        if(frame.contentWindow){
            //mark for garbage collection
            frame.contentWindow = null; 
        }
        
        //create a new scope for the window proxy
        frame.contentWindow = Envjs.proxy();
        new Window(frame.contentWindow, window);
        
        //I dont think frames load asynchronously in firefox
        //and I think the tests have verified this but for
        //some reason I'm less than confident... Are there cases?
        frame.contentDocument = frame.contentWindow.document;
        frame.contentDocument.async = false;
        if(url){
            //console.log('envjs.loadFrame async %s', frame.contentDocument.async);
            frame.contentWindow.location = url;
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
        //clean up all the nodes
        /*all = frame.contentDocument.all,
        length = all.length;
        for(i=0;i<length;i++){
            all[i].removeEventListeners('*', null, null);
            delete all.pop();
        }*/
        delete frame.contentDocument;
        frame.contentDocument = null;
        if(frame.contentWindow){
            frame.contentWindow.close();
        }
        gc();
    }catch(e){
        console.log(e);
    }
};

/**
 * Makes an object window-like by proxying object accessors
 * @param {Object} scope
 * @param {Object} parent
 */
Envjs.proxy = function(scope, parent){

    try{   
        if(scope+'' == '[object global]'){
            return scope
        }else{
            return  __context__.initStandardObjects();
        }
    }catch(e){
        console.log('failed to init standard objects %s %s \n%s', scope, parent, e);
    }
    
};
