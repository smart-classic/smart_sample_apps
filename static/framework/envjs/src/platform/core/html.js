

/**
 * describes which script src values will trigger Envjs to load
 * the script like a browser would
 */
Envjs.scriptTypes = {
    "text/javascript"   :false,
    "text/envjs"        :true
};
    
/**
 * will be called when loading a script throws an error
 * @param {Object} script
 * @param {Object} e
 */
Envjs.onScriptLoadError = function(script, e){
    console.log('error loading script %s %s', script, e);
};


/**
 * load and execute script tag text content
 * @param {Object} script
 */
Envjs.loadInlineScript = function(script){
    var tmpFile;
    tmpFile = Envjs.writeToTempFile(script.text, 'js') ;
    load(tmpFile);
};

/**
 * Should evaluate script in some context
 * @param {Object} context
 * @param {Object} source
 * @param {Object} name
 */
Envjs.eval = function(context, source, name){};


/**
 * Executes a script tag
 * @param {Object} script
 * @param {Object} parser
 */
Envjs.loadLocalScript = function(script){
    //console.log("loading script %s", script);
    var types, 
        src, 
        i, 
        base,
        filename,
        xhr;
    
    if(script.type){
        types = script.type.split(";");
        for(i=0;i<types.length;i++){
            if(Envjs.scriptTypes[types[i]]){
                //ok this script type is allowed
                break;
            }
            if(i+1 == types.length){
                //console.log('wont load script type %s', script.type);
                return false;
            }
        }
    }
    
    try{
        //console.log('handling inline scripts');
        if(!script.src.length){
            Envjs.loadInlineScript(script);
            return true;
        }
    }catch(e){
        //Envjs.error("Error loading script.", e);
        Envjs.onScriptLoadError(script, e);
        return false;
    }
        
        
    //console.log("loading allowed external script %s", script.src);
    
    //lets you register a function to execute 
    //before the script is loaded
    if(Envjs.beforeScriptLoad){
        for(src in Envjs.beforeScriptLoad){
            if(script.src.match(src)){
                Envjs.beforeScriptLoad[src](script);
            }
        }
    }
    base = "" + script.ownerDocument.location;
    filename = Envjs.uri(script.src.match(/([^\?#]*)/)[1], base );
    //console.log('loading script from base %s', base);
    //filename = Envjs.uri(script.src, base);
    try {          
        xhr = new XMLHttpRequest();
        xhr.open("GET", filename, false/*syncronous*/);
        //console.log("loading external script %s", filename);
        xhr.onreadystatechange = function(){
            //console.log("readyState %s", xhr.readyState);
            if(xhr.readyState === 4){
                Envjs.eval(
                    script.ownerDocument.ownerWindow,
                    xhr.responseText,
                    filename
                );
            }    
        };
        xhr.send(null, false);
    } catch(e) {
        console.log("could not load script %s \n %s", filename, e );
        Envjs.onScriptLoadError(script, e);
        return false;
    }
    //lets you register a function to execute 
    //after the script is loaded
    if(Envjs.afterScriptLoad){
        for(src in Envjs.afterScriptLoad){
            if(script.src.match(src)){
                Envjs.afterScriptLoad[src](script);
            }
        }
    }
    return true;
};
    