/**
 * @class  NamedNodeMap -
 *      used to represent collections of nodes that can be accessed by name
 *      typically a set of Element attributes
 *
 * @extends NodeList -
 *      note W3C spec says that this is not the case, but we need an item()
 *      method identical to NodeList's, so why not?
 * @param  ownerDocument : Document - the ownerDocument
 * @param  parentNode    : Node - the node that the NamedNodeMap is attached to (or null)
 */
NamedNodeMap = function(ownerDocument, parentNode) {
    NodeList.apply(this, arguments);
    __setArray__(this, []);
};
NamedNodeMap.prototype = new NodeList();
__extend__(NamedNodeMap.prototype, {
    add: function(name){
        this[this.length] = name;
    },
    getNamedItem : function(name) {
        var ret = null;
        //console.log('NamedNodeMap getNamedItem %s', name);
        // test that Named Node exists
        var itemIndex = __findNamedItemIndex__(this, name);

        if (itemIndex > -1) {
            // found it!
            ret = this[itemIndex];
        }
        // if node is not found, default value null is returned
        return ret;
    },
    setNamedItem : function(arg) {
      //console.log('setNamedItem %s', arg);
      // test for exceptions
      if (__ownerDocument__(this).implementation.errorChecking) {
            // throw Exception if arg was not created by this Document
            if (this.ownerDocument != arg.ownerDocument) {
              throw(new DOMException(DOMException.WRONG_DOCUMENT_ERR));
            }

            // throw Exception if DOMNamedNodeMap is readonly
            if (this._readonly || (this.parentNode && this.parentNode._readonly)) {
              throw(new DOMException(DOMException.NO_MODIFICATION_ALLOWED_ERR));
            }

            // throw Exception if arg is already an attribute of another Element object
            if (arg.ownerElement && (arg.ownerElement != this.parentNode)) {
              throw(new DOMException(DOMException.INUSE_ATTRIBUTE_ERR));
            }
      }

     //console.log('setNamedItem __findNamedItemIndex__ ');
      // get item index
      var itemIndex = __findNamedItemIndex__(this, arg.name);
      var ret = null;

     //console.log('setNamedItem __findNamedItemIndex__ %s', itemIndex);
      if (itemIndex > -1) {                          // found it!
            ret = this[itemIndex];                // use existing Attribute

            // throw Exception if DOMAttr is readonly
            if (__ownerDocument__(this).implementation.errorChecking && ret._readonly) {
              throw(new DOMException(DOMException.NO_MODIFICATION_ALLOWED_ERR));
            } else {
              this[itemIndex] = arg;                // over-write existing NamedNode
              this[arg.name.toLowerCase()] = arg;
            }
      } else {
            // add new NamedNode
           //console.log('setNamedItem add new named node map (by index)');
            Array.prototype.push.apply(this, [arg]);
           //console.log('setNamedItem add new named node map (by name) %s %s', arg, arg.name);
            this[arg.name] = arg;
           //console.log('finsished setNamedItem add new named node map (by name) %s', arg.name);

      }

     //console.log('setNamedItem parentNode');
      arg.ownerElement = this.parentNode;            // update ownerElement
      // return old node or new node
     //console.log('setNamedItem exit');
      return ret;
    },
    removeNamedItem : function(name) {
          var ret = null;
          // test for exceptions
          // throw Exception if NamedNodeMap is readonly
          if (__ownerDocument__(this).implementation.errorChecking &&
                (this._readonly || (this.parentNode && this.parentNode._readonly))) {
              throw(new DOMException(DOMException.NO_MODIFICATION_ALLOWED_ERR));
          }

          // get item index
          var itemIndex = __findNamedItemIndex__(this, name);

          // throw Exception if there is no node named name in this map
          if (__ownerDocument__(this).implementation.errorChecking && (itemIndex < 0)) {
            throw(new DOMException(DOMException.NOT_FOUND_ERR));
          }

          // get Node
          var oldNode = this[itemIndex];
          //this[oldNode.name] = undefined;

          // throw Exception if Node is readonly
          if (__ownerDocument__(this).implementation.errorChecking && oldNode._readonly) {
            throw(new DOMException(DOMException.NO_MODIFICATION_ALLOWED_ERR));
          }

          // return removed node
          return __removeChild__(this, itemIndex);
    },
    getNamedItemNS : function(namespaceURI, localName) {
        var ret = null;

        // test that Named Node exists
        var itemIndex = __findNamedItemNSIndex__(this, namespaceURI, localName);

        if (itemIndex > -1) {
            // found it! return NamedNode
            ret = this[itemIndex];
        }
        // if node is not found, default value null is returned
        return ret;
    },
    setNamedItemNS : function(arg) {
        //console.log('setNamedItemNS %s', arg);
        // test for exceptions
        if (__ownerDocument__(this).implementation.errorChecking) {
            // throw Exception if NamedNodeMap is readonly
            if (this._readonly || (this.parentNode && this.parentNode._readonly)) {
                throw(new DOMException(DOMException.NO_MODIFICATION_ALLOWED_ERR));
            }

            // throw Exception if arg was not created by this Document
            if (__ownerDocument__(this) != __ownerDocument__(arg)) {
                throw(new DOMException(DOMException.WRONG_DOCUMENT_ERR));
            }

            // throw Exception if arg is already an attribute of another Element object
            if (arg.ownerElement && (arg.ownerElement != this.parentNode)) {
                throw(new DOMException(DOMException.INUSE_ATTRIBUTE_ERR));
            }
        }

        // get item index
        var itemIndex = __findNamedItemNSIndex__(this, arg.namespaceURI, arg.localName);
        var ret = null;

        if (itemIndex > -1) {
            // found it!
            // use existing Attribute
            ret = this[itemIndex];
            // throw Exception if Attr is readonly
            if (__ownerDocument__(this).implementation.errorChecking && ret._readonly) {
                throw(new DOMException(DOMException.NO_MODIFICATION_ALLOWED_ERR));
            } else {
                // over-write existing NamedNode
                this[itemIndex] = arg;
            }
        }else {
            // add new NamedNode
            Array.prototype.push.apply(this, [arg]);
        }
        arg.ownerElement = this.parentNode;

        // return old node or null
        return ret;
        //console.log('finished setNamedItemNS %s', arg);
    },
    removeNamedItemNS : function(namespaceURI, localName) {
          var ret = null;

          // test for exceptions
          // throw Exception if NamedNodeMap is readonly
          if (__ownerDocument__(this).implementation.errorChecking && (this._readonly || (this.parentNode && this.parentNode._readonly))) {
            throw(new DOMException(DOMException.NO_MODIFICATION_ALLOWED_ERR));
          }

          // get item index
          var itemIndex = __findNamedItemNSIndex__(this, namespaceURI, localName);

          // throw Exception if there is no matching node in this map
          if (__ownerDocument__(this).implementation.errorChecking && (itemIndex < 0)) {
            throw(new DOMException(DOMException.NOT_FOUND_ERR));
          }

          // get Node
          var oldNode = this[itemIndex];

          // throw Exception if Node is readonly
          if (__ownerDocument__(this).implementation.errorChecking && oldNode._readonly) {
            throw(new DOMException(DOMException.NO_MODIFICATION_ALLOWED_ERR));
          }

          return __removeChild__(this, itemIndex);             // return removed node
    },
    get xml() {
          var ret = "";

          // create string containing concatenation of all (but last) Attribute string values (separated by spaces)
          for (var i=0; i < this.length -1; i++) {
            ret += this[i].xml +" ";
          }

          // add last Attribute to string (without trailing space)
          if (this.length > 0) {
            ret += this[this.length -1].xml;
          }

          return ret;
    },
    toString : function(){
        return "[object NamedNodeMap]";
    }

});

/**
 * @method __findNamedItemIndex__
 *      find the item index of the node with the specified name
 *
 * @param  name : string - the name of the required node
 * @param  isnsmap : if its a NamespaceNodeMap
 * @return : int
 */
var __findNamedItemIndex__ = function(namednodemap, name, isnsmap) {
    var ret = -1;
    // loop through all nodes
    for (var i=0; i<namednodemap.length; i++) {
        // compare name to each node's nodeName
        if(namednodemap[i].localName && name && isnsmap){
            if (namednodemap[i].localName.toLowerCase() == name.toLowerCase()) {
                // found it!
                ret = i;
                break;
            }
        }else{
            if(namednodemap[i].name && name){
                if (namednodemap[i].name.toLowerCase() == name.toLowerCase()) {
                    // found it!
                    ret = i;
                    break;
                }
            }
        }
    }
    // if node is not found, default value -1 is returned
    return ret;
};

/**
 * @method __findNamedItemNSIndex__
 *      find the item index of the node with the specified
 *      namespaceURI and localName
 *
 * @param  namespaceURI : string - the namespace URI of the required node
 * @param  localName    : string - the local name of the required node
 * @return : int
 */
var __findNamedItemNSIndex__ = function(namednodemap, namespaceURI, localName) {
    var ret = -1;
    // test that localName is not null
    if (localName) {
        // loop through all nodes
        for (var i=0; i<namednodemap.length; i++) {
            if(namednodemap[i].namespaceURI && namednodemap[i].localName){
                // compare name to each node's namespaceURI and localName
                if ((namednodemap[i].namespaceURI.toLowerCase() == namespaceURI.toLowerCase()) &&
                    (namednodemap[i].localName.toLowerCase() == localName.toLowerCase())) {
                    // found it!
                    ret = i;
                    break;
                }
            }
        }
    }
    // if node is not found, default value -1 is returned
    return ret;
};

/**
 * @method __hasAttribute__
 *      Returns true if specified node exists
 *
 * @param  name : string - the name of the required node
 * @return : boolean
 */
var __hasAttribute__ = function(namednodemap, name) {
    var ret = false;
    // test that Named Node exists
    var itemIndex = __findNamedItemIndex__(namednodemap, name);
        if (itemIndex > -1) {
        // found it!
        ret = true;
    }
    // if node is not found, default value false is returned
    return ret;
}

/**
 * @method __hasAttributeNS__
 *      Returns true if specified node exists
 *
 * @param  namespaceURI : string - the namespace URI of the required node
 * @param  localName    : string - the local name of the required node
 * @return : boolean
 */
var __hasAttributeNS__ = function(namednodemap, namespaceURI, localName) {
    var ret = false;
    // test that Named Node exists
    var itemIndex = __findNamedItemNSIndex__(namednodemap, namespaceURI, localName);
    if (itemIndex > -1) {
        // found it!
        ret = true;
    }
    // if node is not found, default value false is returned
    return ret;
}

/**
 * @method __cloneNamedNodes__
 *      Returns a NamedNodeMap containing clones of the Nodes in this NamedNodeMap
 *
 * @param  parentNode : Node - the new parent of the cloned NodeList
 * @param  isnsmap : bool - is this a NamespaceNodeMap
 * @return NamedNodeMap containing clones of the Nodes in this NamedNodeMap
 */
var __cloneNamedNodes__ = function(namednodemap, parentNode, isnsmap) {
    var cloneNamedNodeMap = isnsmap?
        new NamespaceNodeMap(namednodemap.ownerDocument, parentNode):
        new NamedNodeMap(namednodemap.ownerDocument, parentNode);

    // create list containing clones of all children
    for (var i=0; i < namednodemap.length; i++) {
        __appendChild__(cloneNamedNodeMap, namednodemap[i].cloneNode(false));
    }

    return cloneNamedNodeMap;
};


/**
 * @class  NamespaceNodeMap -
 *      used to represent collections of namespace nodes that can be
 *      accessed by name typically a set of Element attributes
 *
 * @extends NamedNodeMap
 *
 * @param  ownerDocument : Document - the ownerDocument
 * @param  parentNode    : Node - the node that the NamespaceNodeMap is attached to (or null)
 */
var NamespaceNodeMap = function(ownerDocument, parentNode) {
    this.NamedNodeMap = NamedNodeMap;
    this.NamedNodeMap(ownerDocument, parentNode);
    __setArray__(this, []);
};
NamespaceNodeMap.prototype = new NamedNodeMap();
__extend__(NamespaceNodeMap.prototype, {
    get xml() {
        var ret = "",
            ns,
            ind;
        // identify namespaces declared local to this Element (ie, not inherited)
        for (ind = 0; ind < this.length; ind++) {
            // if namespace declaration does not exist in the containing node's, parentNode's namespaces
            ns = null;
            try {
                var ns = this.parentNode.parentNode._namespaces.
                    getNamedItem(this[ind].localName);
            }catch (e) {
                //breaking to prevent default namespace being inserted into return value
                break;
            }
            if (!(ns && (""+ ns.nodeValue == ""+ this[ind].nodeValue))) {
                // display the namespace declaration
                ret += this[ind].xml +" ";
            }
        }
        return ret;
    }
});
