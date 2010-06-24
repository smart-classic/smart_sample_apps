
/**
 * resolves location relative to doc location
 * @param {Object} path
 * @param {Object} path
 * @param {Object} base
 */
Envjs.uri = function(path, base){
    //console.log('constructing uri from path %s and base %s', path, base);
    var protocol = new RegExp('(^file\:|^http\:|^https\:)'),
        m = protocol.exec(path),
        baseURI, absolutepath;
    if(m&&m.length>1){
        return (new java.net.URL(path).toString()+'')
            .replace('file:/', 'file:///');
    }else if(base){
        baseURI = base.substring(0, base.lastIndexOf('/'));
        if(baseURI.length > 0){
            absolutepath = baseURI + '/' + path;
        }else{
            absolutepath = (new java.net.URL(new java.net.URL(base), path)+'')
                .replace('file:/', 'file:///');
        }
        //console.log('constructed absolute path %s', absolutepath);
        return absolutepath;
    }else{
        //return an absolute url from a url relative to the window location
        //TODO: window should not be inlined here. this should be passed as a 
        //      parameter to Envjs.location :DONE
        if(document){
            baseURI = document.baseURI;
            if(baseURI == 'about:blank'){
                //console.log('about:blank change: baseURI %s', document.baseURI);
                baseURI = (java.io.File(path).toURL().toString()+'')
                        .replace('file:/', 'file:///');
                //console.log('baseURI %s', baseURI);
                return baseURI;
            }else{
                if(path.match(/^\//)){
                    //absolute path change
                    //console.log('absolute path change: baseURI %s', document.baseURI);
                    absolutepath = (new Location(baseURI)).pathname;
                    return baseURI.substring(0, baseURI.lastIndexOf(absolutepath)) + path;
                }else{
                    //relative path change
                    //console.log('relative path change: baseURI %s', document.baseURI);
                    base = baseURI.substring(0, baseURI.lastIndexOf('/'));
                    if(base.length > 0){
                        return base + '/' + path;
                    }else{
                        return (new java.io.File(path).toURL().toString()+'')
                            .replace('file:/', 'file:///');
                    }
                }
            }
        }else{
            return (new java.io.File(path).toURL().toString()+'')
                        .replace('file:/', 'file:///');
        }
    }
};

/**
 * 
 * @param {Object} fn
 * @param {Object} onInterupt
 */
Envjs.runAsync = function(fn, onInterupt){
    ////Envjs.debug("running async");
    var running = true,
        run;
    
    try{
        run = Envjs.sync(function(){ 
            fn();
            Envjs.wait();
        });
        Envjs.spawn(run);
    }catch(e){
        console.log("error while running async operation", e);
        try{if(onInterrupt)onInterrupt(e)}catch(ee){};
    }
};

/**
 * Used to write to a local file
 * @param {Object} text
 * @param {Object} url
 */
Envjs.writeToFile = function(text, url){
    //Envjs.debug("writing text to url : " + url);
    var out = new java.io.FileWriter( 
        new java.io.File( 
            new java.net.URI(url.toString()))); 
    out.write( text, 0, text.length );
    out.flush();
    out.close();
};
    
/**
 * Used to write to a local file
 * @param {Object} text
 * @param {Object} suffix
 */
Envjs.writeToTempFile = function(text, suffix){
    //Envjs.debug("writing text to temp url : " + suffix);
    // Create temp file.
    var temp = java.io.File.createTempFile("envjs-tmp", suffix);

    // Delete temp file when program exits.
    temp.deleteOnExit();

    // Write to temp file
    var out = new java.io.FileWriter(temp);
    out.write(text, 0, text.length);
    out.close();
    return temp.getAbsolutePath().toString()+'';
};
    

/**
 * Used to delete a local file
 * @param {Object} url
 */
Envjs.deleteFile = function(url){
    var file = new java.io.File( new java.net.URI( url ) );
    file["delete"]();
};
    
/**
 * establishes connection and calls responsehandler
 * @param {Object} xhr
 * @param {Object} responseHandler
 * @param {Object} data
 */
Envjs.connection = function(xhr, responseHandler, data){
    var url = java.net.URL(xhr.url),
        connection;
    if ( /^file\:/.test(url) ) {
        try{
            if ( xhr.method == "PUT" ) {
                var text =  data || "" ;
                Envjs.writeToFile(text, url);
            } else if ( xhr.method == "DELETE" ) {
                Envjs.deleteFile(url);
            } else {
                connection = url.openConnection();
                connection.connect();
                //try to add some canned headers that make sense
                
                try{
                    if(xhr.url.match(/html$/)){
                        xhr.responseHeaders["Content-Type"] = 'text/html';
                    }else if(xhr.url.match(/.xml$/)){
                        xhr.responseHeaders["Content-Type"] = 'text/xml';
                    }else if(xhr.url.match(/.js$/)){
                        xhr.responseHeaders["Content-Type"] = 'text/javascript';
                    }else if(xhr.url.match(/.json$/)){
                        xhr.responseHeaders["Content-Type"] = 'application/json';
                    }else{
                        xhr.responseHeaders["Content-Type"] = 'text/plain';
                    }
                //xhr.responseHeaders['Last-Modified'] = connection.getLastModified();
                //xhr.responseHeaders['Content-Length'] = headerValue+'';
                //xhr.responseHeaders['Date'] = new Date()+'';*/
                }catch(e){
                    console.log('failed to load response headers',e);
                }
            }
        }catch(e){
            console.log('failed to open file %s %s', url, e);
            connection = null;
            xhr.readyState = 4;
            xhr.statusText = "Local File Protocol Error";
            xhr.responseText = "<html><head/><body><p>"+ e+ "</p></body></html>";
        }
    } else { 
        connection = url.openConnection();
        connection.setRequestMethod( xhr.method );
        
        // Add headers to Java connection
        for (var header in xhr.headers){
            connection.addRequestProperty(header+'', xhr.headers[header]+'');
        }
        
        //write data to output stream if required
        if(data){
            if(data instanceof Document){
                if ( xhr.method == "PUT" || xhr.method == "POST" ) {
                    connection.setDoOutput(true);
                    var outstream = connection.getOutputStream(),
                        xml = (new XMLSerializer()).serializeToString(data),
                        outbuffer = new java.lang.String(xml).getBytes('UTF-8');
                    outstream.write(outbuffer, 0, outbuffer.length);
                    outstream.close();
                }
            }else if(data.length&&data.length>0){
                if ( xhr.method == "PUT" || xhr.method == "POST" ) {
                    connection.setDoOutput(true);
                    var outstream = connection.getOutputStream(),
                        outbuffer = new java.lang.String(data).getBytes('UTF-8');
                    outstream.write(outbuffer, 0, outbuffer.length);
                    outstream.close();
                }
            }
            connection.connect();
        }else{
            connection.connect();
        }
    }
    
    if(connection){
        try{
            var respheadlength = connection.getHeaderFields().size();
            // Stick the response headers into responseHeaders
            for (var i = 0; i < respheadlength; i++) { 
                var headerName = connection.getHeaderFieldKey(i); 
                var headerValue = connection.getHeaderField(i); 
                if (headerName)
                    xhr.responseHeaders[headerName+''] = headerValue+'';
            }
        }catch(e){
            console.log('failed to load response headers \n%s',e);
        }
        
        xhr.readyState = 4;
        xhr.status = parseInt(connection.responseCode,10) || undefined;
        xhr.statusText = connection.responseMessage || "";
        
        var contentEncoding = connection.getContentEncoding() || "utf-8",
            baos = new java.io.ByteArrayOutputStream(),
            buffer = java.lang.reflect.Array.newInstance(java.lang.Byte.TYPE, 1024),
            length,
            stream = null,
            responseXML = null;

        try{
            stream = (contentEncoding.equalsIgnoreCase("gzip") || 
                      contentEncoding.equalsIgnoreCase("decompress") )?
                new java.util.zip.GZIPInputStream(connection.getInputStream()) :
                connection.getInputStream();
        }catch(e){
            if (connection.getResponseCode() == 404){
                console.log('failed to open connection stream \n %s %s',
                          e.toString(), e);
            }else{
                console.log('failed to open connection stream \n %s %s',
                           e.toString(), e);
            }
            stream = connection.getErrorStream();
        }
        
        while ((length = stream.read(buffer)) != -1) {
            baos.write(buffer, 0, length);
        }

        baos.close();
        stream.close();

        xhr.responseText = java.nio.charset.Charset.forName("UTF-8").
            decode(java.nio.ByteBuffer.wrap(baos.toByteArray())).toString()+"";
            
    }
    if(responseHandler){
        //Envjs.debug('calling ajax response handler');
        responseHandler();
    }
};
