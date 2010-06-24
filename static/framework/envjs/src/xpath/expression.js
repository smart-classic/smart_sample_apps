/**
 * @todo: refactor
 */
$debug("Defining XPathExpression");
/*
* XPathExpression 
*/
$w.__defineGetter__("XPathExpression", function(){
    return XPathExpression;
});

var XPathExpression = function() {};
__extend__(XPathExpression.prototype, {
    evaluate: function(){
        //TODO for now just return an empty XPathResult
        return new XPathResult();        
    }
});