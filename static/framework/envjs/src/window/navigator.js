

/*
 *      navigator.js
 *  Browser Navigator
 */
Navigator = function(){
	var $userAgent;
    return {
        get appCodeName(){
            return Envjs.appCodeName;
        },
        get appName(){
            return Envjs.appName;
        },
        get appVersion(){
            return Envjs.version +" ("+
                this.platform +"; "+
                "U; "+//?
                Envjs.os_name+" "+Envjs.os_arch+" "+Envjs.os_version+"; "+
                (Envjs.lang?Envjs.lang:"en-US")+"; "+
                "rv:"+Envjs.revision+
                ")";
        },
        get cookieEnabled(){
            return true;
        },
        get mimeTypes(){
            return [];
        },
        get platform(){
            return Envjs.platform;
        },
        get plugins(){
            return [];
        },
        get userAgent(){
            return $userAgent||(this.appCodeName + "/" + this.appVersion + " Resig/20070309 PilotFish/@BUILD_VERSION@");
        },
		set userAgent(agent){
			$userAgent = agent;
		},
        javaEnabled : function(){
            return Envjs.javaEnabled;
        }
    };
};

