/**
 * @class   XPathResult
 * @author  thatcher
 */

var XPathResult = function() {
    this.snapshotLength = 0;
    this.stringValue = '';
};

__extend__( XPathResult, {
    ANY_TYPE:                     0,
    NUMBER_TYPE:                  1,
    STRING_TYPE:                  2,
    BOOLEAN_TYPE:                 3,
    UNORDERED_NODE_ITERATOR_TYPE: 4,
    ORDERED_NODEITERATOR_TYPE:    5,
    UNORDERED_NODE_SNAPSHOT_TYPE: 6,
    ORDERED_NODE_SNAPSHOT_TYPE:   7,
    ANY_ORDERED_NODE_TYPE:        8,
    FIRST_ORDERED_NODE_TYPE:      9
});

__extend__(XPathResult.prototype, {
    get booleanValue(){
      //TODO  
    },
    get invalidIteration(){
        //TODO
    },
    get numberValue(){
        //TODO
    },
    get resultType(){
        //TODO
    },
    get singleNodeValue(){
        //TODO
    },
    iterateNext: function(){
        //TODO
    },
    snapshotItem: function(index){
        //TODO
    }
});

