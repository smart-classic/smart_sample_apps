<xsl:stylesheet 
xmlns:xsl="http://www.w3.org/1999/XSL/Transform" 
xmlns:xs="http://www.w3.org/2001/XMLSchema"
xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
xmlns:med="http://smartplatforms.org/med#" 
xmlns:sp="http://smartplatforms.org/" 
xmlns:dcterms="http://purl.org/dc/terms/"
xmlns:dc="http://purl.org/dc/elements/1.1/"
xmlns:foaf="http://xmlns.com/foaf/0.1/"
xmlns:rxcui="http://link.informatics.stonybrook.edu/rxnorm/RXCUI/"
xmlns:ccr='urn:astm-org:CCR'
exclude-result-prefixes="xs"
version="1.0">
<xsl:output method="xml" indent="yes"/>

<xsl:variable name="smallcase" select="'abcdefghijklmnopqrstuvwxyz '" />
<xsl:variable name="uppercase" select="'ABCDEFGHIJKLMNOPQRSTUVWXYZ_'" />
<xsl:template match="//text()" />

<xsl:template match="/">
<rdf:RDF>
<xsl:apply-templates select=".//ccr:Actors/ccr:Actor"/>
</rdf:RDF>
</xsl:template>

<xsl:template match="ccr:Actor[./ccr:ActorObjectID='Patient']" >
<rdf:Description>
	<rdf:type rdf:resource="http://xmlns.com/foaf/0.1/Person"/>
	<foaf:givenName><xsl:value-of select='.//ccr:BirthName/ccr:Given'/></foaf:givenName>
	<foaf:familyName><xsl:value-of select='.//ccr:BirthName/ccr:Family'/></foaf:familyName>
	<foaf:gender><xsl:choose><xsl:when test=".//ccr:Gender/ccr:Text='M'">male</xsl:when><xsl:otherwise>female</xsl:otherwise></xsl:choose></foaf:gender>
	<sp:zipcode><xsl:value-of select='.//ccr:PostalCode'/></sp:zipcode>
</rdf:Description>
</xsl:template>
</xsl:stylesheet>

