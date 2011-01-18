<xsl:stylesheet 
xmlns:xsl="http://www.w3.org/1999/XSL/Transform" 
xmlns:xs="http://www.w3.org/2001/XMLSchema"
xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
xmlns:sp="http://smartplatforms.org/terms#" 
xmlns:dcterms="http://purl.org/dc/terms/"
xmlns:dc="http://purl.org/dc/elements/1.1/"
xmlns:foaf="http://xmlns.com/foaf/0.1/"
xmlns:ccr='urn:astm-org:CCR'
exclude-result-prefixes="xs"
version="1.0">
<xsl:output method="xml" indent="yes"/>

<xsl:variable name="smallcase" select="'abcdefghijklmnopqrstuvwxyz '" />
<xsl:variable name="uppercase" select="'ABCDEFGHIJKLMNOPQRSTUVWXYZ_'" />
<xsl:key name="med-by-rxnorm" match="//ccr:Medication" use=".//ccr:Value[translate(../ccr:CodingSystem, $uppercase, $smallcase)='rxnorm']"/>

<xsl:template match="//text()" />

<xsl:template match="/">
<rdf:RDF>
<xsl:apply-templates select=".//ccr:Medication"/>
</rdf:RDF>
</xsl:template>

<xsl:template name="fulfillment">
  <xsl:variable name="med_id" select="./ccr:CCRDataObjectID"/> 
  <xsl:variable name="dispense_date" select=".//ccr:ExactDateTime[../ccr:Type/ccr:Text='Dispense date']"/>
  <xsl:variable name="pbm" select="//ccr:Actor/ccr:IDs/ccr:ID[../ccr:Type/ccr:Text='PBMID'][../..//ccr:LinkID=$med_id][../..//ccr:ActorRole/ccr:Text='Dispensing Information Source'] " />

  <xsl:variable name="pharmacy_NCPDP" select="//ccr:Actor/ccr:IDs/ccr:ID[../ccr:Type/ccr:Text='NCPDP'][../..//ccr:LinkID=$med_id] " />
  <xsl:variable name="pharmacy_name" select="//ccr:Actor//ccr:Name[../..//ccr:LinkID=$med_id][../..//ccr:ActorRole/ccr:Text='Dispensing pharmacy'] " />


  <xsl:variable name="clinician_DEA" select="//ccr:Actor//ccr:ID[../ccr:Type/ccr:Text='DEA'][../..//ccr:LinkID=$med_id] " />
  <xsl:variable name="clinician_name" select="//ccr:Actor//ccr:DisplayName[../../..//ccr:LinkID=$med_id] " />

  <xsl:variable name="quantity" select=".//ccr:Fulfillment/ccr:Quantity/ccr:Value"/>
  <xsl:variable name="quantityu" select="translate(normalize-space(.//ccr:Fulfillment/ccr:Quantity/ccr:Units), $uppercase,$smallcase)"/>
  <xsl:variable name="fulfillments" select="count(.//Fulfillment)" />
  <sp:fulfillment>  
    <sp:Fulfillment>
      <xsl:choose><xsl:when test="$dispense_date">
         <dc:date><xsl:value-of select='$dispense_date'/></dc:date>
        </xsl:when>
      </xsl:choose>
      <xsl:choose><xsl:when test="$pbm">
      <sp:PBM><xsl:value-of select='$pbm'/></sp:PBM>
      </xsl:when></xsl:choose>
      <xsl:choose><xsl:when test="$pharmacy_name">
            <sp:pharmacy>
	      <sp:Pharmacy>
	      <sp:ncpdpid><xsl:value-of select='$pharmacy_NCPDP'/></sp:ncpdpid>
	      <foaf:name><xsl:value-of select='$pharmacy_name'/></foaf:name>
	      </sp:Pharmacy>
	    </sp:pharmacy>
      </xsl:when></xsl:choose>
      <xsl:choose><xsl:when test="$clinician_name">
      <sp:provider>
        <sp:Provider>
	  <sp:dea><xsl:value-of select='$clinician_DEA'/></sp:dea>
	  <foaf:name><xsl:value-of select='$clinician_name'/></foaf:name>
	</sp:Provider>
      </sp:provider>
      </xsl:when></xsl:choose>
      <xsl:choose><xsl:when test="$quantity">
      <sp:dispenseQuantity><xsl:value-of select='$quantity'/></sp:dispenseQuantity>
      </xsl:when></xsl:choose>
      <xsl:choose><xsl:when test="$quantityu and $quantityu != 'not specified'">
      <sp:dispenseUnit><xsl:value-of select='$quantityu'/></sp:dispenseUnit>
      </xsl:when></xsl:choose>
    </sp:Fulfillment>
  </sp:fulfillment>  
</xsl:template>

<xsl:template match="ccr:Medication">
  <xsl:variable name="cui" select="normalize-space(.//ccr:ProductName/ccr:Code/ccr:Value[translate(../ccr:CodingSystem, $uppercase, $smallcase)='rxnorm'])"/>
    <xsl:if test="generate-id() = generate-id(key('med-by-rxnorm', $cui))">

<sp:Medication>


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


  <xsl:choose>
  <xsl:when test="$medid">
  <xsl:attribute name="rdf:about"><xsl:value-of select="@id"/></xsl:attribute>
  </xsl:when>
  </xsl:choose>

  <xsl:choose><xsl:when test="$cui">
  	    <sp:drugName>
	    <sp:CodedValue>
	    <sp:code><xsl:attribute name="rdf:resource">http://link.informatics.stonybrook.edu/rxnorm/RXCUI/<xsl:value-of select="$cui"/></xsl:attribute></sp:code>
	    <xsl:choose><xsl:when test="$name">
  	      <dcterms:title><xsl:value-of select="$name"/></dcterms:title>
	    </xsl:when></xsl:choose>
	    </sp:CodedValue>
	    </sp:drugName>
  </xsl:when></xsl:choose>


  <xsl:choose><xsl:when test="$dose">
  	    <sp:dose><xsl:value-of select="$dose"/></sp:dose>
  </xsl:when></xsl:choose>
  <xsl:choose><xsl:when test="$doseu">
  	    <sp:doseUnit><xsl:value-of select="$doseu"/></sp:doseUnit>
  </xsl:when></xsl:choose>
  <xsl:choose><xsl:when test="$route">
  	    <sp:route><xsl:value-of select="$route"/></sp:route>
  </xsl:when></xsl:choose>
  <xsl:choose><xsl:when test="$freq">
  	    <sp:frequency><xsl:value-of select="$freq"/></sp:frequency>
  </xsl:when></xsl:choose>

  <xsl:variable name="start_date" select=".//ccr:ExactDateTime[../ccr:Type/ccr:Text='Start date']" />
  <xsl:choose>
  <xsl:when test="$start_date">
	<sp:startDate>
	<xsl:value-of select="$start_date" />
	</sp:startDate>
  </xsl:when>
  </xsl:choose>

  <xsl:variable name="end_date" select=".//ccr:ExactDateTime[../ccr:Type/ccr:Text='Stop date']" />
  <xsl:choose>
  <xsl:when test="$end_date">
	<sp:endDate>
	<xsl:value-of select="$end_date" />
	</sp:endDate>
  </xsl:when>
  </xsl:choose>

  <xsl:choose><xsl:when test="$strength">
  	    <sp:strength><xsl:value-of select="$strength"/></sp:strength>
  </xsl:when></xsl:choose>
  <xsl:choose><xsl:when test="$strengthu and $strengthu != 'not specified'">
  	    <sp:strengthUnit><xsl:value-of select="$strengthu"/></sp:strengthUnit>
  </xsl:when></xsl:choose>
  <xsl:choose><xsl:when test="form">
  	    <sp:form><xsl:value-of select="$form"/></sp:form>
  </xsl:when></xsl:choose>

<xsl:choose><xsl:when test="$instructions">
<sp:instructions>
<xsl:value-of select="$instructions"/>
</sp:instructions>
</xsl:when>
</xsl:choose>

  <xsl:for-each select="key('med-by-rxnorm', $cui)" >
      <xsl:call-template name="fulfillment" />  
  </xsl:for-each>



</sp:Medication>
</xsl:if> <!-- Only look at medications with unique RxNorm codes -->

</xsl:template>

</xsl:stylesheet>

