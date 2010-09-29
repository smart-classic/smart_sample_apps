
Envjs.shell = new Packages.java.util.Scanner(Packages.java.lang.System['in']);
/**
 * Rhino provides a very succinct 'sync'
 * @param {Function} fn
 */
try{
    Envjs.sync = sync;
    Envjs.spawn = spawn;
} catch(e){
    //sync unavailable on AppEngine
    Envjs.sync = function(fn){
        //console.log('Threadless platform, sync is safe');
        return fn;
    };

    Envjs.spawn = function(fn){
        //console.log('Threadless platform, spawn shares main thread.');
        return fn();
    };
}

/**
 * sleep thread for specified duration
 * @param {Object} millseconds
 */
Envjs.sleep = function(millseconds){
    try{
        java.lang.Thread.currentThread().sleep(millseconds);
    }catch(e){
        console.log('Threadless platform, cannot sleep.');
    }
};

/**
 * provides callback hook for when the system exits
 */
Envjs.onExit = function(callback){
    var rhino = Packages.org.mozilla.javascript,
        contextFactory =  __context__.getFactory(),
        listener = new rhino.ContextFactory.Listener({
            contextReleased: function(context){
                if(context === __context__)
                    console.log('context released', context);
                contextFactory.removeListener(this);
                if(callback)
                    callback();
            }
        });
    contextFactory.addListener(listener);
};
