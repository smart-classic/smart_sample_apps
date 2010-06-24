
/**
 * @todo: document
 */
var HASH     = new RegExp('(\\#.*)'),
    HOSTNAME = new RegExp('\/\/([^\:\/]+)'),
    PATHNAME = new RegExp('(\/[^\\?\\#]*)'),
    PORT     = new RegExp('\:(\\d+)\/'),
    PROTOCOL = new RegExp('(^\\w*\:)'),
    SEARCH   = new RegExp('(\\?[^\\#]*)');
        

Location = function(url, doc, history){
    //console.log('Location url %s', url);
    var $url = url
        $document = doc?doc:null,
        $history = history?history:null;
    
    return {
        get hash(){
            var m = HASH.exec($url);
            return m&&m.length>1?m[1]:"";
        },
        set hash(hash){
            $url = this.protocol + this.host + this.pathname + 
                this.search + (hash.indexOf('#')===0?hash:"#"+hash);
            if($history){
                $history.add( $url, 'hash');
            }
        },
        get host(){
            return this.hostname + (this.port !== ""?":"+this.port:"");
        },
        set host(host){
            $url = this.protocol + host + this.pathname + 
                this.search + this.hash;
            if($history){
                $history.add( $url, 'host');
            }
            this.assign($url);
        },
        get hostname(){
            var m = HOSTNAME.exec(this.href);
            return m&&m.length>1?m[1]:"";
        },
        set hostname(hostname){
            $url = this.protocol + hostname + ((this.port==="")?"":(":"+this.port)) +
                 this.pathname + this.search + this.hash;
            if($history){
                $history.add( $url, 'hostname');
            }
            this.assign($url);
        },
        get href(){
            return $url;
        },
        set href(url){
            $url = url;  
            if($history){
                $history.add( $url, 'href');
            }
            this.assign($url);
        },
        get pathname(){
            var m = this.href;
            m = PATHNAME.exec(m.substring(m.indexOf(this.hostname)));
            return m&&m.length>1?m[1]:"/";
        },
        set pathname(pathname){
            $url = this.protocol + this.host + pathname + 
                this.search + this.hash;
            if($history){
                $history.add( $url, 'pathname');
            }
            this.assign($url);
        },
        get port(){
            var m = PORT.exec(this.href);
            return m&&m.length>1?m[1]:"";
        },
        set port(port){
            $url = this.protocol + this.hostname + ":"+port + this.pathname + 
                this.search + this.hash;
            if($history){
                $history.add( $url, 'port');
            }
            this.assign($url);
        },
        get protocol(){
            return this.href && PROTOCOL.exec(this.href)[0];
        },
        set protocol(protocol){
            $url = protocol + this.host + this.pathname + 
                this.search + this.hash;
            if($history){
                $history.add( $url, 'protocol');
            }
            this.assign($url);
        },
        get search(){
            var m = SEARCH.exec(this.href);
            return m&&m.length>1?m[1]:"";
        },
        set search(search){
            $url = this.protocol + this.host + this.pathname + 
                search + this.hash;
            if($history){
                $history.add( $url, 'search');
            }
            this.assign($url);
        },
        toString: function(){
            return $url;
        },
        assign: function(url){
            var _this = this,
                xhr;
            
            //console.log('assigning %s',url);
            $url = url;
            //we can only assign if this Location is associated with a document
            if($document){
                //console.log("fetching %s (async? %s)", url, $document.async);
                xhr = new XMLHttpRequest();
                xhr.open("GET", url, false);//$document.async);
                
                if($document.toString()=="[object HTMLDocument]"){
                    //tell the xhr to not parse the document as XML
                    //console.log("loading html document");
                    xhr.onreadystatechange = function(){
                        //console.log("readyState %s", xhr.readyState);
                        if(xhr.readyState === 4){
                            $document.baseURI = new Location(url, $document);
                            //console.log('new document baseURI %s', $document.baseURI);
                            __exchangeHTMLDocument__($document, xhr.responseText, url);
                        }    
                    };
                    xhr.send(null, false);
                }else{
                    //Treat as an XMLDocument
                    xhr.onreadystatechange = function(){
                        if(xhr.readyState === 4){
                            $document = xhr.responseXML;
                            $document.baseURI = $url;
                            if($document.createEvent){
                                event = $document.createEvent('Events');
                                event.initEvent("DOMContentLoaded");
                                $document.dispatchEvent( event, false );
                            }
                        }
                    };
                    xhr.send();
                }
                
            };
            
        },
        reload: function(forceget){
            //for now we have no caching so just proxy to assign
            //console.log('reloading %s',$url);
            this.assign($url);
        },
        replace: function(url){
            this.assign(url);
        }
    }
};

var __exchangeHTMLDocument__ = function(doc, text, url){
    var html, head, title, body, event;
    try{
        doc.baseURI = url;
        HTMLParser.parseDocument(text, doc);
        Envjs.wait();
    }catch(e){
        console.log('parsererror %s', e);
        try{
            console.log('document \n %s', doc.documentElement.outerHTML);
        }catch(ee){}
        doc = new HTMLDocument(new DOMImplementation(), doc.ownerWindow);
        html =    doc.createElement('html');
        head =    doc.createElement('head');
        title =   doc.createElement('title');
        body =    doc.createElement('body');
        title.appendChild(doc.createTextNode("Error"));
        body.appendChild(doc.createTextNode(e+''));
        head.appendChild(title);
        html.appendChild(head);
        html.appendChild(body);
        doc.appendChild(html);
        //console.log('default error document \n %s', doc.documentElement.outerHTML);
        
        //DOMContentLoaded event
        if(doc.createEvent){
            event = doc.createEvent('Events');
            event.initEvent("DOMContentLoaded", false, false);
            doc.dispatchEvent( event, false );
            
            event = doc.createEvent('HTMLEvents');
            event.initEvent("load", false, false);
            doc.dispatchEvent( event, false );
        }
        
        //finally fire the window.onload event
        //TODO: this belongs in window.js which is a event
        //      event handler for DOMContentLoaded on document
        
        try{
            if(doc === window.document){
                console.log('triggering window.load')
                event = doc.createEvent('HTMLEvents');
                event.initEvent("load", false, false);
                window.dispatchEvent( event, false );
            }
        }catch(e){
            //console.log('window load event failed %s', e);
            //swallow
        }
    }
};