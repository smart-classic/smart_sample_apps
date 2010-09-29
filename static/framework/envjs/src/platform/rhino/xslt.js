

/**
 * This is all cruft from a refactor that needs to go away or be
 * cleaned up.  The XPath and XSLT functions are partially in
 * place but would require significant work and so have been left
 * for later or someones labor of love.
 */

var htmlDocBuilder = Packages.javax.xml.parsers.DocumentBuilderFactory.newInstance();
htmlDocBuilder.setNamespaceAware(false);
htmlDocBuilder.setValidating(false);


var xmlDocBuilder = Packages.javax.xml.parsers.DocumentBuilderFactory.newInstance();
xmlDocBuilder.setNamespaceAware(true);
xmlDocBuilder.setValidating(false);

$env.parseXML = function(xmlstring){
    return xmlDocBuilder.newDocumentBuilder().parse(
        new java.io.ByteArrayInputStream(
            (new java.lang.String(xmlstring)).getBytes("UTF8")));
};


$env.xpath = function(expression, doc){
    return Packages.javax.xml.xpath.
        XPathFactory.newInstance().newXPath().
        evaluate(expression, doc, javax.xml.xpath.XPathConstants.NODESET);
};

var jsonmlxslt;
$env.jsonml = function(xmlstring){
    jsonmlxslt = jsonmlxslt||$env.xslt($env.xml2jsonml.toXMLString());
    var jsonml = $env.transform(jsonmlxslt, xmlstring);
    //$env.debug('jsonml :\n'+jsonml);
    return eval(jsonml);
};
var transformerFactory;
$env.xslt = function(xsltstring){
    transformerFactory = transformerFactory||
        Packages.javax.xml.transform.TransformerFactory.newInstance();
    return transformerFactory.newTransformer(
        new javax.xml.transform.dom.DOMSource(
            $env.parseXML(xsltstring)
        )
    );
};
$env.transform = function(xslt, xmlstring){
    var baos = new java.io.ByteArrayOutputStream();
    xslt.transform(
        new javax.xml.transform.dom.DOMSource($env.parseHTML(xmlstring)),
        new javax.xml.transform.stream.StreamResult(baos)
    );
    return java.nio.charset.Charset.forName("UTF-8").
        decode(java.nio.ByteBuffer.wrap(baos.toByteArray())).toString()+"";
};
