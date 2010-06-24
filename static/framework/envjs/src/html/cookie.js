
/*
 *	cookie.js 
 *  Private internal helper class used to save/retreive cookies
 */
var Cookies = {
	persistent:{
		//domain - key on domain name {
			//path - key on path {
				//name - key on name {
					 //value : cookie value
					 //other cookie properties
				//}
			//}
		//}
		//expire - provides a timestamp for expiring the cookie
		//cookie - the cookie!
	},
	temporary:{//transient is a reserved word :(
		//like above
	}
};

//HTMLDocument cookie
Cookies.set = function(doc, cookie){
	var i,
        index,
        name,
        value,
        properties = {},
        attr,
        attrs = cookie.split(";");
    
    var domainValid = function(doc, value){
        var i,
            domainParts = doc.domain.splt('.').reverse(),
            newDomainParts = value.split('.').reverse();
        if(newDomainParts.length > 1){
            for(i=0;i<newDomainParts.length;i++){
                if(!(newDomainParts[i] == domainParts[i])){
                    return false;
                }
            }
            return true;
        }
        return false;
    };
	//for now the strategy is to simply create a json object
	//and post it to a file in the .cookies.js file.  I hate parsing
	//dates so I decided not to implement support for 'expires' 
	//(which is deprecated) and instead focus on the easier 'max-age'
	//(which succeeds 'expires') 
	cookie = {};//keyword properties of the cookie
	cookie['domain']=doc.domain;
    if(typeof(doc.location) == 'object'){
        cookie['path'] = doc.location.pathname;
    }else{
        cookie.path = '/';
    }
	for(i=0;i<attrs.length;i++){
		index = attrs[i].indexOf("=");
        if(index > -1){
            name = __trim__(attrs[i].slice(0,index));
            value = __trim__(attrs[i].slice(index+1));
            if(name=='max-age'){
               //we'll have to set a timer to check these
				//and garbage collect expired cookies
				cookie[name] = parseInt(value, 10);
			} else if(name=='domain'){
				if(domainValid(doc, value)){
					cookie['domain']=value;
				}
			} else if(name=='path'){
				//not sure of any special logic for path
				cookie['path'] = value;
			} else {
				//its not a cookie keyword so store it in our array of properties
				//and we'll serialize individually in a moment
				properties[name] = value;
			}
		}else{
			if(attrs[i] == 'secure'){
                cookie[attrs[i]] = true;
			}
		}
	}
	if(!cookie['max-age']){
		//it's a transient cookie so it only lasts as long as 
		//the window.location remains the same
		__mergeCookie__(Cookies.temporary, cookie, properties);
	}else if(cookie['max-age']===0){
		//delete the cookies
		//TODO
	}else{
		//the cookie is persistent
		__mergeCookie__(Cookies.persistent, cookie, properties);
		__persistCookies__();
	}
};

Cookies.get = function(doc){
	//The cookies that are returned must belong to the same domain
	//and be at or below the current window.location.path.  Also
	//we must check to see if the cookie was set to 'secure' in which
	//case we must check our current location.protocol to make sure it's
	//https:
	return  __cookieString__(Cookies.temporary, doc) + 
            __cookieString__(Cookies.persistent, doc); 	
};

function __cookieString__(cookies, doc) {
    var cookieString = ""
        domain, 
        path,
        name;
    for (domain in cookies) {
        // check if the cookie is in the current domain (if domain is set)
        if (domain == "" || domain == doc.domain) {
            for (path in cookies[domain]) {
                // make sure path is at or below the window location path
                if (path == "/" || doc.documentURI.indexOf(path) > 0) {
                    for (name in cookies[domain][path]) {
                        cookieString += 
                            name+"="+cookies[domain][path][name].value+";";
                    }
                }
            }
        }
    }
    return cookieString;
};

function __mergeCookie__(target, cookie, properties){
	var name, now;
	if(!target[cookie.domain]){
		target[cookie.domain] = {};
	}
	if(!target[cookie.domain][cookie.path]){
		target[cookie.domain][cookie.path] = {};
	}
	for(name in properties){
		now = new Date().getTime();
		target[cookie.domain][cookie.path][name] = {
			value:properties[name],
			"@env:secure":cookie.secure,
			"@env:max-age":cookie['max-age'],
			"@env:date-created":now,
			"@env:expiration":now + cookie['max-age']
		};
	}
};

function __persistCookies__(){
	//TODO
	//I think it should be done via $env so it can be customized
};

function __loadCookies__(){
	//TODO
	//should also be configurable via $env	
    try{
        //TODO - load cookies
        
    }catch(e){
        //TODO - fail gracefully
    }   
};

	