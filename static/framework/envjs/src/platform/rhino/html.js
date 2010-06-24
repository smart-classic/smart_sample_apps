
/**
 * load and execute script tag text content
 * @param {Object} script
 */
Envjs.loadInlineScript = function(script){
    if(script.ownerDocument.ownerWindow){
        Envjs.eval(
            script.ownerDocument.ownerWindow,
            script.text,
            'eval('+script.text.substring(0,16)+'...):'+new Date().getTime()
        );
    }else{
        Envjs.eval(
            __this__,
            script.text,
            'eval('+script.text.substring(0,16)+'...):'+new Date().getTime()
        );
    }
	if(Envjs.afterInlineScriptLoad){
         Envjs.afterInlineScriptLoad(script)
    }
    //console.log('evaluated at scope %s \n%s', 
    //    script.ownerDocument.ownerWindow.guid, script.text);
};


Envjs.eval = function(context, source, name){
    __context__.evaluateString(
        context,
        source,
        name,
        0,
        null
    );
}
