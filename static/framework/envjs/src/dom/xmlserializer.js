/**
 * @author envjs team
 * @class XMLSerializer
 */

XMLSerializer = function() {};

__extend__(XMLSerializer.prototype, {
    serializeToString: function(node){
        return node.xml;
    },
    toString : function(){
        return "[object XMLSerializer]";
    }
});
