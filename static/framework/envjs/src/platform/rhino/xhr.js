
/**
 * Get 'Current Working Directory'
 */
Envjs.getcwd = function() {
	// changed to support windows slashes (\)
    return (String (java.lang.System.getProperty('user.dir'))).replace(/\\/g,'/');
}

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
 * Used to read the contents of a local file
 * @param {Object} url
 */
Envjs.readFromFile = function( url ){
    var fileReader = new java.io.FileReader(
        new java.io.File( 
            new java.net.URI( url )));
            
    var stringwriter = new java.io.StringWriter(),
        buffer = java.lang.reflect.Array.newInstance(java.lang.Character.TYPE, 1024),
        length;

    while ((length = fileReader.read(buffer, 0, 1024)) != -1) {
        stringwriter.write(buffer, 0, length);
    }

    stringwriter.close();
    return stringwriter.toString()+"";
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
        connection,
        header,
        outstream,
        buffer,
        length,
        binary = false,
        name, value,
        contentEncoding,
        instream,
        responseXML,
        i;
    
        
    if ( /^file\:/.test(url) ) {
        try{
            if ( "PUT" == xhr.method || "POST" == xhr.method ) {
                data =  data || "" ;
                Envjs.writeToFile(data, url);
                xhr.readyState = 4;
                //could be improved, I just cant recall the correct http codes
                xhr.status = 200;
                xhr.statusText = "";
            } else if ( xhr.method == "DELETE" ) {
                Envjs.deleteFile(url);
                xhr.readyState = 4;
                //could be improved, I just cant recall the correct http codes
                xhr.status = 200;
                xhr.statusText = "";
            } else {
                //try to add some canned headers that make sense
                xhr.readyState = 4;
                xhr.statusText = "ok";
                xhr.responseText = Envjs.readFromFile(xhr.url);
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
        //handle redirects manually since cookie support sucks out of the box
        connection.setFollowRedirects(false);
        connection.setRequestMethod( xhr.method );

        // Add headers to Java connection
        for (header in xhr.headers){
            connection.addRequestProperty(header+'', xhr.headers[header]+'');
        }
        connection.addRequestProperty("Accept-Encoding", 'gzip');
        connection.addRequestProperty("Agent", 'gzip');

        //write data to output stream if required
        if(data){
            if(data instanceof Document){
                if ( xhr.method == "PUT" || xhr.method == "POST" ) {
                    connection.setDoOutput(true);
                    outstream = connection.getOutputStream(),
                    xml = (new XMLSerializer()).serializeToString(data);
                    buffer = new java.lang.String(xml).getBytes('UTF-8');
                    outstream.write(buffer, 0, buffer.length);
                    outstream.close();
                }
            }else if(data.length&&data.length>0){
                if ( xhr.method == "PUT" || xhr.method == "POST" ) {
                    connection.setDoOutput(true);
                    outstream = connection.getOutputStream();
                    buffer = new java.lang.String(data).getBytes('UTF-8');
                    outstream.write(buffer, 0, buffer.length);
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
            length = connection.getHeaderFields().size();
            // Stick the response headers into responseHeaders
            for (i = 0; i < length; i++) {
                name = connection.getHeaderFieldKey(i);
                value = connection.getHeaderField(i);
                if (name)
                    xhr.responseHeaders[name+''] = value+'';
            }
        }catch(e){
            console.log('failed to load response headers \n%s',e);
        }

        xhr.readyState = 4;
        xhr.status = parseInt(connection.responseCode,10) || undefined;
        xhr.statusText = connection.responseMessage || "";

        contentEncoding = connection.getContentEncoding() || "utf-8";
        instream = null;
        responseXML = null;
        
        try{
            //console.log('contentEncoding %s', contentEncoding);
            if( contentEncoding.equalsIgnoreCase("gzip") ||
                contentEncoding.equalsIgnoreCase("decompress")){
                //zipped content
                binary = true;
                outstream = new java.io.ByteArrayOutputStream();
                buffer = java.lang.reflect.Array.newInstance(java.lang.Byte.TYPE, 1024);
                instream = new java.util.zip.GZIPInputStream(connection.getInputStream())
            }else{
                //this is a text file
                outstream = new java.io.StringWriter();
                buffer = java.lang.reflect.Array.newInstance(java.lang.Character.TYPE, 1024);
                instream = new java.io.InputStreamReader(connection.getInputStream());
            }
        }catch(e){
            if (connection.getResponseCode() == 404){
                console.log('failed to open connection stream \n %s %s',
                            e.toString(), e);
            }else{
                console.log('failed to open connection stream \n %s %s',
                            e.toString(), e);
            }
            instream = connection.getErrorStream();
        }

        while ((length = instream.read(buffer, 0, 1024)) != -1) {
            outstream.write(buffer, 0, length);
        }

        outstream.close();
        instream.close();
        
        if(binary){
            xhr.responseText = new java.lang.String(outstream.toByteArray(), 'UTF-8')+'';
        }else{
            xhr.responseText = outstream.toString()+'';
        }

    }
    if(responseHandler){
        //Envjs.debug('calling ajax response handler');
        responseHandler();
    }
};
