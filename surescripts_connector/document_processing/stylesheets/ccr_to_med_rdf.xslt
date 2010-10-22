<xsl:stylesheet 
xmlns:xsl="http://www.w3.org/1999/XSL/Transform" 
xmlns:xs="http://www.w3.org/2001/XMLSchema"
xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
xmlns:med="http://smartplatforms.org/medication#"
xmlns:sp="http://smartplatforms.org/" 
xmlns:dcterms="http://purl.org/dc/terms/"
xmlns:dc="http://purl.org/dc/elements/1.1/"
xmlns:foaf="http://xmlns.com/foaf/0.1/Person/"
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
<xsl:apply-templates select=".//ccr:Medication"/>
</rdf:RDF>
</xsl:template>

<xsl:template name="fulfillment">
  <xsl:variable name="med_id" select="./ccr:CCRDataObjectID"/> 
  <xsl:variable name="dispense_date" select=".//ccr:ExactDateTime[../ccr:Type/ccr:Text='Dispense date']"/>
  <xsl:variable name="pbm" select="//ccr:Actor/ccr:IDs/ccr:ID[../ccr:Type/ccr:Text='PBMID'][../..//ccr:LinkID=$med_id] " />
  <xsl:variable name="pharmacy" select="//ccr:Actor/ccr:IDs/ccr:ID[../ccr:Type/ccr:Text='NCPDP'][../..//ccr:LinkID=$med_id] " />
  <xsl:variable name="clinician" select="//ccr:Actor/ccr:IDs/ccr:ID[../ccr:Type/ccr:Text='DEA'][../..//ccr:LinkID=$med_id] " />
  <xsl:variable name="quantity" select=".//ccr:Fulfillment/ccr:Quantity/ccr:Value"/>
  <xsl:variable name="quantityu" select="normalize-space(.//ccr:Fulfillment/ccr:Quantity/ccr:Units)"/>
  <xsl:variable name="fulfillments" select="count(.//Fulfillment)" />
  <sp:fulfillment>  
    <rdf:Description>
      <rdf:type><xsl:attribute name="rdf:resource">http://smartplatforms.org/fulfillment</xsl:attribute></rdf:type>
      <xsl:choose><xsl:when test="$dispense_date">
      <dc:date><xsl:value-of select='$dispense_date'/></dc:date>
      </xsl:when>
      </xsl:choose>
      <xsl:choose><xsl:when test="$pbm">
      <sp:PBM><xsl:value-of select='$pbm'/></sp:PBM>
      </xsl:when></xsl:choose>
      <xsl:choose><xsl:when test="$pharmacy">
      <sp:pharmacy><xsl:value-of select='$pharmacy'/></sp:pharmacy>
      </xsl:when></xsl:choose>
      <xsl:choose><xsl:when test="$clinician">
      <sp:prescriber><xsl:value-of select='$clinician'/></sp:prescriber>
      </xsl:when></xsl:choose>
      <xsl:choose><xsl:when test="$quantity">
      <sp:dispenseQuantity><xsl:value-of select='$quantity'/></sp:dispenseQuantity>
      </xsl:when></xsl:choose>
      <xsl:choose><xsl:when test="$quantityu and $quantityu != 'Not Specified'">
      <sp:dispenseUnits><xsl:value-of select='$quantityu'/></sp:dispenseUnits>
      </xsl:when></xsl:choose>
    </rdf:Description>
  </sp:fulfillment>  
</xsl:template>

<xsl:template match="ccr:Medication">
<rdf:Description>
  <xsl:variable name="medid" select="@id" />
  <xsl:variable name="dose" select='normalize-space(.//ccr:Dose/ccr:Value)'/>
  <xsl:variable name="doseu" select='translate(normalize-space(.//ccr:Dose/ccr:Units), $uppercase, $smallcase)'/>
  <xsl:variable name="route" select='translate(normalize-space(.//ccr:Route/ccr:Text), $uppercase, $smallcase)'/>
  <xsl:variable name="freq" select='normalize-space(.//ccr:Frequency/ccr:Value)'/>
  <xsl:variable name="name" select='normalize-space(.//ccr:ProductName/ccr:Text)'/>
  <xsl:variable name="strength" select='normalize-space(.//ccr:Strength/ccr:Value)'/>
  <xsl:variable name="instructions" select='normalize-space(.//ccr:Directions//ccr:Text)'/>
  <xsl:variable name="strengthu" select='translate(normalize-space(.//ccr:Strength/ccr:Units), $uppercase, $smallcase)'/>
  <xsl:variable name="form" select='translate(normalize-space(.//ccr:Product/ccr:Form/ccr:Text), $uppercase, $smallcase)'/>
  <xsl:variable name="cui" select="normalize-space(.//ccr:ProductName/ccr:Code/ccr:Value[translate(../ccr:CodingSystem, $uppercase, $smallcase)='rxnorm'])"/>
  <xsl:variable name="fulfillments" select="count(.//ccr:Fulfillment)" />

  <xsl:choose>
  <xsl:when test="$medid">
  <xsl:attribute name="rdf:about"><xsl:value-of select="@id"/></xsl:attribute>
  </xsl:when>
  </xsl:choose>


  <rdf:type><xsl:attribute name="rdf:resource">http://smartplatforms.org/medication</xsl:attribute></rdf:type>

  <xsl:choose><xsl:when test="$cui">
  	    <med:drug><xsl:attribute name="rdf:resource">http://link.informatics.stonybrook.edu/rxnorm/RXCUI/<xsl:value-of select="$cui"/></xsl:attribute></med:drug>
  </xsl:when></xsl:choose>



  <xsl:choose><xsl:when test="$dose">
  	    <med:dose><xsl:value-of select="$dose"/></med:dose>
  </xsl:when></xsl:choose>
  <xsl:choose><xsl:when test="$doseu">
  	    <med:doseUnits><xsl:value-of select="$doseu"/></med:doseUnits>
  </xsl:when></xsl:choose>
  <xsl:choose><xsl:when test="$route">
  	    <med:route><xsl:value-of select="$route"/></med:route>
  </xsl:when></xsl:choose>
  <xsl:choose><xsl:when test="$freq">
  	    <med:frequency><xsl:value-of select="$freq"/></med:frequency>
  </xsl:when></xsl:choose>

  <xsl:variable name="start_date" select=".//ccr:ExactDateTime[../ccr:Type/ccr:Text='Start date']" />
  <xsl:choose>
  <xsl:when test="$start_date">
	<med:startDate>
	<xsl:value-of select="$start_date" />
	</med:startDate>
  </xsl:when>
  </xsl:choose>

  <xsl:variable name="end_date" select=".//ccr:ExactDateTime[../ccr:Type/ccr:Text='Stop date']" />
  <xsl:choose>
  <xsl:when test="$end_date">
	<med:endDate>
	<xsl:value-of select="$end_date" />
	</med:endDate>
  </xsl:when>
  </xsl:choose>


  <xsl:choose><xsl:when test="$name">
  	    <dcterms:title><xsl:value-of select="$name"/></dcterms:title>
  </xsl:when></xsl:choose>
  <xsl:choose><xsl:when test="$strength">
  	    <med:strength><xsl:value-of select="$strength"/></med:strength>
  </xsl:when></xsl:choose>
  <xsl:choose><xsl:when test="$strengthu">
  	    <med:strengthUnits><xsl:value-of select="$strengthu"/></med:strengthUnits>
  </xsl:when></xsl:choose>
  <xsl:choose><xsl:when test="form">
  	    <med:form><xsl:value-of select="$form"/></med:form>
  </xsl:when></xsl:choose>

<xsl:choose><xsl:when test="$instructions">
<med:instructions>
<xsl:value-of select="$instructions"/>
</med:instructions>
</xsl:when>
</xsl:choose>


  <xsl:choose>
    <xsl:when test="$fulfillments=1">
      <xsl:call-template name="fulfillment" />
    </xsl:when>
  </xsl:choose>



</rdf:Description>

	    
</xsl:template>

</xsl:stylesheet>

