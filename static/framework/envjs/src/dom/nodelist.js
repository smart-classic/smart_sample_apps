
/**
 * @class  NodeList -
 *      provides the abstraction of an ordered collection of nodes
 *
 * @param  ownerDocument : Document - the ownerDocument
 * @param  parentNode    : Node - the node that the NodeList is attached to (or null)
 */
NodeList = function(ownerDocument, parentNode) {
    this.length = 0;
    this.parentNode = parentNode;
    this.ownerDocument = ownerDocument;
    this._readonly = false;
    __setArray__(this, []);
};

__extend__(NodeList.prototype, {
    item : function(index) {
        var ret = null;
        if ((index >= 0) && (index < this.length)) {
            // bounds check
            ret = this[index];
        }
        // if the index is out of bounds, default value null is returned
        return ret;
    },
    get xml() {
        var ret = "",
            i;

        // create string containing the concatenation of the string values of each child
        for (i=0; i < this.length; i++) {
            if(this[i]){
                if(this[i].nodeType == Node.TEXT_NODE && i>0 &&
                   this[i-1].nodeType == Node.TEXT_NODE){
                    //add a single space between adjacent text nodes
                    ret += " "+this[i].xml;
                }else{
                    ret += this[i].xml;
                }
            }
        }
        return ret;
    },
    toArray: function () {
        var children = [],
            i;
        for ( i=0; i < this.length; i++) {
            children.push (this[i]);
        }
        return children;
    },
    toString: function(){
        return "[object NodeList]";
    }
});


/**
 * @method __findItemIndex__
 *      find the item index of the node
 * @author Jon van Noort (jon@webarcana.com.au)
 * @param  node : Node
 * @return : int
 */
var __findItemIndex__ = function (nodelist, node) {
    var ret = -1, i;
    for (i=0; i<nodelist.length; i++) {
        // compare id to each node's _id
        if (nodelist[i] === node) {
            // found it!
            ret = i;
            break;
        }
    }
    // if node is not found, default value -1 is returned
    return ret;
};

/**
 * @method __insertBefore__
 *      insert the specified Node into the NodeList before the specified index
 *      Used by Node.insertBefore(). Note: Node.insertBefore() is responsible
 *      for Node Pointer surgery __insertBefore__ simply modifies the internal
 *      data structure (Array).
 * @param  newChild      : Node - the Node to be inserted
 * @param  refChildIndex : int     - the array index to insert the Node before
 */
var __insertBefore__ = function(nodelist, newChild, refChildIndex) {
    if ((refChildIndex >= 0) && (refChildIndex <= nodelist.length)) {
        // bounds check
        if (newChild.nodeType == Node.DOCUMENT_FRAGMENT_NODE) {
            // node is a DocumentFragment
            // append the children of DocumentFragment
            Array.prototype.splice.apply(nodelist,
                [refChildIndex, 0].concat(newChild.childNodes.toArray()));
        }
        else {
            // append the newChild
            Array.prototype.splice.apply(nodelist,[refChildIndex, 0, newChild]);
        }
    }
};

/**
 * @method __replaceChild__
 *      replace the specified Node in the NodeList at the specified index
 *      Used by Node.replaceChild(). Note: Node.replaceChild() is responsible
 *      for Node Pointer surgery __replaceChild__ simply modifies the internal
 *      data structure (Array).
 *
 * @param  newChild      : Node - the Node to be inserted
 * @param  refChildIndex : int     - the array index to hold the Node
 */
var __replaceChild__ = function(nodelist, newChild, refChildIndex) {
    var ret = null;

    // bounds check
    if ((refChildIndex >= 0) && (refChildIndex < nodelist.length)) {
        // preserve old child for return
        ret = nodelist[refChildIndex];

        if (newChild.nodeType == Node.DOCUMENT_FRAGMENT_NODE) {
            // node is a DocumentFragment
            // get array containing children prior to refChild
            Array.prototype.splice.apply(nodelist,
                [refChildIndex, 1].concat(newChild.childNodes.toArray()));
        }
        else {
            // simply replace node in array (links between Nodes are
            // made at higher level)
            nodelist[refChildIndex] = newChild;
        }
    }
    // return replaced node
    return ret;
};

/**
 * @method __removeChild__
 *      remove the specified Node in the NodeList at the specified index
 *      Used by Node.removeChild(). Note: Node.removeChild() is responsible
 *      for Node Pointer surgery __removeChild__ simply modifies the internal
 *      data structure (Array).
 * @param  refChildIndex : int - the array index holding the Node to be removed
 */
var __removeChild__ = function(nodelist, refChildIndex) {
    var ret = null;

    if (refChildIndex > -1) {
        // found it!
        // return removed node
        ret = nodelist[refChildIndex];

        // rebuild array without removed child
        Array.prototype.splice.apply(nodelist,[refChildIndex, 1]);
    }
    // return removed node
    return ret;
};

/**
 * @method __appendChild__
 *      append the specified Node to the NodeList. Used by Node.appendChild().
 *      Note: Node.appendChild() is responsible for Node Pointer surgery
 *      __appendChild__ simply modifies the internal data structure (Array).
 * @param  newChild      : Node - the Node to be inserted
 */
var __appendChild__ = function(nodelist, newChild) {
    if (newChild.nodeType == Node.DOCUMENT_FRAGMENT_NODE) {
        // node is a DocumentFragment
        // append the children of DocumentFragment
        Array.prototype.push.apply(nodelist, newChild.childNodes.toArray() );
    } else {
        // simply add node to array (links between Nodes are made at higher level)
        Array.prototype.push.apply(nodelist, [newChild]);
    }

};

/**
 * @method __cloneNodes__ -
 *      Returns a NodeList containing clones of the Nodes in this NodeList
 * @param  deep : boolean -
 *      If true, recursively clone the subtree under each of the nodes;
 *      if false, clone only the nodes themselves (and their attributes,
 *      if it is an Element).
 * @param  parentNode : Node - the new parent of the cloned NodeList
 * @return : NodeList - NodeList containing clones of the Nodes in this NodeList
 */
var __cloneNodes__ = function(nodelist, deep, parentNode) {
    var cloneNodeList = new NodeList(nodelist.ownerDocument, parentNode);

    // create list containing clones of each child
    for (var i=0; i < nodelist.length; i++) {
        __appendChild__(cloneNodeList, nodelist[i].cloneNode(deep));
    }

    return cloneNodeList;
};

