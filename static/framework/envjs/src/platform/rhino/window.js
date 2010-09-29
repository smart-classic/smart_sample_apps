
//Since we're running in rhino I guess we can safely assume
//java is 'enabled'.  I'm sure this requires more thought
//than I've given it here
Envjs.javaEnabled = true;

Envjs.homedir        = java.lang.System.getProperty("user.home");
Envjs.tmpdir         = java.lang.System.getProperty("java.io.tmpdir");
Envjs.os_name        = java.lang.System.getProperty("os.name");
Envjs.os_arch        = java.lang.System.getProperty("os.arch");
Envjs.os_version     = java.lang.System.getProperty("os.version");
Envjs.lang           = java.lang.System.getProperty("user.lang");


Envjs.gc = function(){ gc(); };

/**
 * Makes an object window-like by proxying object accessors
 * @param {Object} scope
 * @param {Object} parent
 */
Envjs.proxy = function(scope, parent) {
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
