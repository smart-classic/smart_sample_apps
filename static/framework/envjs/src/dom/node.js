
var __ownerDocument__ = function(node){
    return (node.nodeType == Node.DOCUMENT_NODE)?node:node.ownerDocument;
};

/**
 * @class  Node -
 *      The Node interface is the primary datatype for the entire
 *      Document Object Model. It represents a single node in the
 *      document tree.
 * @param  ownerDocument : Document - The Document object associated with this node.
 */

Node = function(ownerDocument) {
    this.baseURI = 'about:blank';
    this.namespaceURI = null;
    this.nodeName = "";
    this.nodeValue = null;

    // A NodeList that contains all children of this node. If there are no
    // children, this is a NodeList containing no nodes.  The content of the
    // returned NodeList is "live" in the sense that, for instance, changes to
    // the children of the node object that it was created from are immediately
    // reflected in the nodes returned by the NodeList accessors; it is not a
    // static snapshot of the content of the node. This is true for every
    // NodeList, including the ones returned by the getElementsByTagName method.
    this.childNodes      = new NodeList(ownerDocument, this);

    // The first child of this node. If there is no such node, this is null
    this.firstChild      = null;
    // The last child of this node. If there is no such node, this is null.
    this.lastChild       = null;
    // The node immediately preceding this node. If there is no such node,
    // this is null.
    this.previousSibling = null;
    // The node immediately following this node. If there is no such node,
    // this is null.
    this.nextSibling     = null;

    this.attributes = null;
    // The namespaces in scope for this node
    this._namespaces = new NamespaceNodeMap(ownerDocument, this);
    this._readonly = false;

    //IMPORTANT: These must come last so rhino will not iterate parent
    //           properties before child properties.  (qunit.equiv issue)

    // The parent of this node. All nodes, except Document, DocumentFragment,
    // and Attr may have a parent.  However, if a node has just been created
    // and not yet added to the tree, or if it has been removed from the tree,
    // this is null
    this.parentNode      = null;
    // The Document object associated with this node
    this.ownerDocument = ownerDocument;

};

// nodeType constants
Node.ELEMENT_NODE                = 1;
Node.ATTRIBUTE_NODE              = 2;
Node.TEXT_NODE                   = 3;
Node.CDATA_SECTION_NODE          = 4;
Node.ENTITY_REFERENCE_NODE       = 5;
Node.ENTITY_NODE                 = 6;
Node.PROCESSING_INSTRUCTION_NODE = 7;
Node.COMMENT_NODE                = 8;
Node.DOCUMENT_NODE               = 9;
Node.DOCUMENT_TYPE_NODE          = 10;
Node.DOCUMENT_FRAGMENT_NODE      = 11;
Node.NOTATION_NODE               = 12;
Node.NAMESPACE_NODE              = 13;

Node.DOCUMENT_POSITION_EQUAL        = 0x00;
Node.DOCUMENT_POSITION_DISCONNECTED = 0x01;
Node.DOCUMENT_POSITION_PRECEDING    = 0x02;
Node.DOCUMENT_POSITION_FOLLOWING    = 0x04;
Node.DOCUMENT_POSITION_CONTAINS     = 0x08;
Node.DOCUMENT_POSITION_CONTAINED_BY = 0x10;
Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC      = 0x20;


__extend__(Node.prototype, {
    get localName(){
        return this.prefix?
            this.nodeName.substring(this.prefix.length+1, this.nodeName.length):
            this.nodeName;
    },
    get prefix(){
        return this.nodeName.split(':').length>1?
            this.nodeName.split(':')[0]:
            null;
    },
    set prefix(value){
        if(value === null){
            this.nodeName = this.localName;
        }else{
            this.nodeName = value+':'+this.localName;
        }
    },
    hasAttributes : function() {
        if (this.attributes.length == 0) {
            return false;
        }else{
            return true;
        }
    },
    get textContent(){
        return __recursivelyGatherText__(this);
    },
    set textContent(newText){
        while(this.firstChild != null){
            this.removeChild( this.firstChild );
        }
        var text = this.ownerDocument.createTextNode(newText);
        this.appendChild(text);
    },
    insertBefore : function(newChild, refChild) {
        var prevNode;

        if(newChild==null){
            return newChild;
        }
        if(refChild==null){
            this.appendChild(newChild);
            return this.newChild;
        }

        // test for exceptions
        if (__ownerDocument__(this).implementation.errorChecking) {
            // throw Exception if Node is readonly
            if (this._readonly) {
                throw(new DOMException(DOMException.NO_MODIFICATION_ALLOWED_ERR));
            }

            // throw Exception if newChild was not created by this Document
            if (__ownerDocument__(this) != __ownerDocument__(newChild)) {
                throw(new DOMException(DOMException.WRONG_DOCUMENT_ERR));
            }

            // throw Exception if the node is an ancestor
            if (__isAncestor__(this, newChild)) {
                throw(new DOMException(DOMException.HIERARCHY_REQUEST_ERR));
            }
        }

        // if refChild is specified, insert before it
        if (refChild) {
            // find index of refChild
            var itemIndex = __findItemIndex__(this.childNodes, refChild);
            // throw Exception if there is no child node with this id
            if (__ownerDocument__(this).implementation.errorChecking && (itemIndex < 0)) {
                throw(new DOMException(DOMException.NOT_FOUND_ERR));
            }

            // if the newChild is already in the tree,
            var newChildParent = newChild.parentNode;
            if (newChildParent) {
                // remove it
                newChildParent.removeChild(newChild);
            }

            // insert newChild into childNodes
            __insertBefore__(this.childNodes, newChild, itemIndex);

            // do node pointer surgery
            prevNode = refChild.previousSibling;

            // handle DocumentFragment
            if (newChild.nodeType == Node.DOCUMENT_FRAGMENT_NODE) {
                if (newChild.childNodes.length > 0) {
                    // set the parentNode of DocumentFragment's children
                    for (var ind = 0; ind < newChild.childNodes.length; ind++) {
                        newChild.childNodes[ind].parentNode = this;
                    }

                    // link refChild to last child of DocumentFragment
                    refChild.previousSibling = newChild.childNodes[newChild.childNodes.length-1];
                }
            }else {
                // set the parentNode of the newChild
                newChild.parentNode = this;
                // link refChild to newChild
                refChild.previousSibling = newChild;
            }

        }else {
            // otherwise, append to end
            prevNode = this.lastChild;
            this.appendChild(newChild);
        }

        if (newChild.nodeType == Node.DOCUMENT_FRAGMENT_NODE) {
            // do node pointer surgery for DocumentFragment
            if (newChild.childNodes.length > 0) {
                if (prevNode) {
                    prevNode.nextSibling = newChild.childNodes[0];
                }else {
                    // this is the first child in the list
                    this.firstChild = newChild.childNodes[0];
                }
                newChild.childNodes[0].previousSibling = prevNode;
                newChild.childNodes[newChild.childNodes.length-1].nextSibling = refChild;
            }
        }else {
            // do node pointer surgery for newChild
            if (prevNode) {
                prevNode.nextSibling = newChild;
            }else {
                // this is the first child in the list
                this.firstChild = newChild;
            }
            newChild.previousSibling = prevNode;
            newChild.nextSibling     = refChild;
        }

        return newChild;
    },
    replaceChild : function(newChild, oldChild) {
        var ret = null;

        if(newChild==null || oldChild==null){
            return oldChild;
        }

        // test for exceptions
        if (__ownerDocument__(this).implementation.errorChecking) {
            // throw Exception if Node is readonly
            if (this._readonly) {
                throw(new DOMException(DOMException.NO_MODIFICATION_ALLOWED_ERR));
            }

            // throw Exception if newChild was not created by this Document
            if (__ownerDocument__(this) != __ownerDocument__(newChild)) {
                throw(new DOMException(DOMException.WRONG_DOCUMENT_ERR));
            }

            // throw Exception if the node is an ancestor
            if (__isAncestor__(this, newChild)) {
                throw(new DOMException(DOMException.HIERARCHY_REQUEST_ERR));
            }
        }

        // get index of oldChild
        var index = __findItemIndex__(this.childNodes, oldChild);

        // throw Exception if there is no child node with this id
        if (__ownerDocument__(this).implementation.errorChecking && (index < 0)) {
            throw(new DOMException(DOMException.NOT_FOUND_ERR));
        }

        // if the newChild is already in the tree,
        var newChildParent = newChild.parentNode;
        if (newChildParent) {
            // remove it
            newChildParent.removeChild(newChild);
        }

        // add newChild to childNodes
        ret = __replaceChild__(this.childNodes,newChild, index);


        if (newChild.nodeType == Node.DOCUMENT_FRAGMENT_NODE) {
            // do node pointer surgery for Document Fragment
            if (newChild.childNodes.length > 0) {
                for (var ind = 0; ind < newChild.childNodes.length; ind++) {
                    newChild.childNodes[ind].parentNode = this;
                }

                if (oldChild.previousSibling) {
                    oldChild.previousSibling.nextSibling = newChild.childNodes[0];
                } else {
                    this.firstChild = newChild.childNodes[0];
                }

                if (oldChild.nextSibling) {
                    oldChild.nextSibling.previousSibling = newChild;
                } else {
                    this.lastChild = newChild.childNodes[newChild.childNodes.length-1];
                }

                newChild.childNodes[0].previousSibling = oldChild.previousSibling;
                newChild.childNodes[newChild.childNodes.length-1].nextSibling = oldChild.nextSibling;
            }
        } else {
            // do node pointer surgery for newChild
            newChild.parentNode = this;

            if (oldChild.previousSibling) {
                oldChild.previousSibling.nextSibling = newChild;
            }else{
                this.firstChild = newChild;
            }
            if (oldChild.nextSibling) {
                oldChild.nextSibling.previousSibling = newChild;
            }else{
                this.lastChild = newChild;
            }
            newChild.previousSibling = oldChild.previousSibling;
            newChild.nextSibling = oldChild.nextSibling;
        }

        return ret;
    },
    removeChild : function(oldChild) {
        if(!oldChild){
            return null;
        }
        // throw Exception if NamedNodeMap is readonly
        if (__ownerDocument__(this).implementation.errorChecking &&
            (this._readonly || oldChild._readonly)) {
            throw(new DOMException(DOMException.NO_MODIFICATION_ALLOWED_ERR));
        }

        // get index of oldChild
        var itemIndex = __findItemIndex__(this.childNodes, oldChild);

        // throw Exception if there is no child node with this id
        if (__ownerDocument__(this).implementation.errorChecking && (itemIndex < 0)) {
            throw(new DOMException(DOMException.NOT_FOUND_ERR));
        }

        // remove oldChild from childNodes
        __removeChild__(this.childNodes, itemIndex);

        // do node pointer surgery
        oldChild.parentNode = null;

        if (oldChild.previousSibling) {
            oldChild.previousSibling.nextSibling = oldChild.nextSibling;
        }else {
            this.firstChild = oldChild.nextSibling;
        }
        if (oldChild.nextSibling) {
            oldChild.nextSibling.previousSibling = oldChild.previousSibling;
        }else {
            this.lastChild = oldChild.previousSibling;
        }

        oldChild.previousSibling = null;
        oldChild.nextSibling = null;

        return oldChild;
    },
    appendChild : function(newChild) {
        if(!newChild){
            return null;
        }
        // test for exceptions
        if (__ownerDocument__(this).implementation.errorChecking) {
            // throw Exception if Node is readonly
            if (this._readonly) {
                throw(new DOMException(DOMException.NO_MODIFICATION_ALLOWED_ERR));
            }

            // throw Exception if arg was not created by this Document
            if (__ownerDocument__(this) != __ownerDocument__(this)) {
                throw(new DOMException(DOMException.WRONG_DOCUMENT_ERR));
            }

            // throw Exception if the node is an ancestor
            if (__isAncestor__(this, newChild)) {
              throw(new DOMException(DOMException.HIERARCHY_REQUEST_ERR));
            }
        }

        // if the newChild is already in the tree,
        var newChildParent = newChild.parentNode;
        if (newChildParent) {
            // remove it
           //console.debug('removing node %s', newChild);
            newChildParent.removeChild(newChild);
        }

        // add newChild to childNodes
        __appendChild__(this.childNodes, newChild);

        if (newChild.nodeType == Node.DOCUMENT_FRAGMENT_NODE) {
            // do node pointer surgery for DocumentFragment
            if (newChild.childNodes.length > 0) {
                for (var ind = 0; ind < newChild.childNodes.length; ind++) {
                    newChild.childNodes[ind].parentNode = this;
                }

                if (this.lastChild) {
                    this.lastChild.nextSibling = newChild.childNodes[0];
                    newChild.childNodes[0].previousSibling = this.lastChild;
                    this.lastChild = newChild.childNodes[newChild.childNodes.length-1];
                } else {
                    this.lastChild = newChild.childNodes[newChild.childNodes.length-1];
                    this.firstChild = newChild.childNodes[0];
                }
            }
        } else {
            // do node pointer surgery for newChild
            newChild.parentNode = this;
            if (this.lastChild) {
                this.lastChild.nextSibling = newChild;
                newChild.previousSibling = this.lastChild;
                this.lastChild = newChild;
            } else {
                this.lastChild = newChild;
                this.firstChild = newChild;
            }
       }
       return newChild;
    },
    hasChildNodes : function() {
        return (this.childNodes.length > 0);
    },
    cloneNode: function(deep) {
        // use importNode to clone this Node
        //do not throw any exceptions
        try {
            return __ownerDocument__(this).importNode(this, deep);
        } catch (e) {
            //there shouldn't be any exceptions, but if there are, return null
            // may want to warn: $debug("could not clone node: "+e.code);
            return null;
        }
    },
    normalize : function() {
        var i;
        var inode;
        var nodesToRemove = new NodeList();

        if (this.nodeType == Node.ELEMENT_NODE || this.nodeType == Node.DOCUMENT_NODE) {
            var adjacentTextNode = null;

            // loop through all childNodes
            for(i = 0; i < this.childNodes.length; i++) {
                inode = this.childNodes.item(i);

                if (inode.nodeType == Node.TEXT_NODE) {
                    // this node is a text node
                    if (inode.length < 1) {
                        // this text node is empty
                        // add this node to the list of nodes to be remove
                        __appendChild__(nodesToRemove, inode);
                    }else {
                        if (adjacentTextNode) {
                            // previous node was also text
                            adjacentTextNode.appendData(inode.data);
                            // merge the data in adjacent text nodes
                            // add this node to the list of nodes to be removed
                            __appendChild__(nodesToRemove, inode);
                        } else {
                            // remember this node for next cycle
                            adjacentTextNode = inode;
                        }
                    }
                } else {
                    // (soon to be) previous node is not a text node
                    adjacentTextNode = null;
                    // normalize non Text childNodes
                    inode.normalize();
                }
            }

            // remove redundant Text Nodes
            for(i = 0; i < nodesToRemove.length; i++) {
                inode = nodesToRemove.item(i);
                inode.parentNode.removeChild(inode);
            }
        }
    },
    isSupported : function(feature, version) {
        // use Implementation.hasFeature to determine if this feature is supported
        return __ownerDocument__(this).implementation.hasFeature(feature, version);
    },
    getElementsByTagName : function(tagname) {
        // delegate to _getElementsByTagNameRecursive
        // recurse childNodes
        var nodelist = new NodeList(__ownerDocument__(this));
        for (var i = 0; i < this.childNodes.length; i++) {
            __getElementsByTagNameRecursive__(this.childNodes.item(i),
                                              tagname,
                                              nodelist);
        }
        return nodelist;
    },
    getElementsByTagNameNS : function(namespaceURI, localName) {
        // delegate to _getElementsByTagNameNSRecursive
        return __getElementsByTagNameNSRecursive__(this, namespaceURI, localName,
            new NodeList(__ownerDocument__(this)));
    },
    importNode : function(importedNode, deep) {
        var i;
        var importNode;

        //there is no need to perform namespace checks since everything has already gone through them
        //in order to have gotten into the DOM in the first place. The following line
        //turns namespace checking off in ._isValidNamespace
        __ownerDocument__(this).importing = true;

        if (importedNode.nodeType == Node.ELEMENT_NODE) {
            if (!__ownerDocument__(this).implementation.namespaceAware) {
                // create a local Element (with the name of the importedNode)
                importNode = __ownerDocument__(this).createElement(importedNode.tagName);

                // create attributes matching those of the importedNode
                for(i = 0; i < importedNode.attributes.length; i++) {
                    importNode.setAttribute(importedNode.attributes.item(i).name, importedNode.attributes.item(i).value);
                }
            } else {
                // create a local Element (with the name & namespaceURI of the importedNode)
                importNode = __ownerDocument__(this).createElementNS(importedNode.namespaceURI, importedNode.nodeName);

                // create attributes matching those of the importedNode
                for(i = 0; i < importedNode.attributes.length; i++) {
                    importNode.setAttributeNS(importedNode.attributes.item(i).namespaceURI,
                        importedNode.attributes.item(i).name, importedNode.attributes.item(i).value);
                }

                // create namespace definitions matching those of the importedNode
                for(i = 0; i < importedNode._namespaces.length; i++) {
                    importNode._namespaces[i] = __ownerDocument__(this).createNamespace(importedNode._namespaces.item(i).localName);
                    importNode._namespaces[i].value = importedNode._namespaces.item(i).value;
                }
            }
        } else if (importedNode.nodeType == Node.ATTRIBUTE_NODE) {
            if (!__ownerDocument__(this).implementation.namespaceAware) {
                // create a local Attribute (with the name of the importedAttribute)
                importNode = __ownerDocument__(this).createAttribute(importedNode.name);
            } else {
                // create a local Attribute (with the name & namespaceURI of the importedAttribute)
                importNode = __ownerDocument__(this).createAttributeNS(importedNode.namespaceURI, importedNode.nodeName);

                // create namespace definitions matching those of the importedAttribute
                for(i = 0; i < importedNode._namespaces.length; i++) {
                    importNode._namespaces[i] = __ownerDocument__(this).createNamespace(importedNode._namespaces.item(i).localName);
                    importNode._namespaces[i].value = importedNode._namespaces.item(i).value;
                }
            }

            // set the value of the local Attribute to match that of the importedAttribute
            importNode.value = importedNode.value;

        } else if (importedNode.nodeType == Node.DOCUMENT_FRAGMENT_NODE) {
            // create a local DocumentFragment
            importNode = __ownerDocument__(this).createDocumentFragment();
        } else if (importedNode.nodeType == Node.NAMESPACE_NODE) {
            // create a local NamespaceNode (with the same name & value as the importedNode)
            importNode = __ownerDocument__(this).createNamespace(importedNode.nodeName);
            importNode.value = importedNode.value;
        } else if (importedNode.nodeType == Node.TEXT_NODE) {
            // create a local TextNode (with the same data as the importedNode)
            importNode = __ownerDocument__(this).createTextNode(importedNode.data);
        } else if (importedNode.nodeType == Node.CDATA_SECTION_NODE) {
            // create a local CDATANode (with the same data as the importedNode)
            importNode = __ownerDocument__(this).createCDATASection(importedNode.data);
        } else if (importedNode.nodeType == Node.PROCESSING_INSTRUCTION_NODE) {
            // create a local ProcessingInstruction (with the same target & data as the importedNode)
            importNode = __ownerDocument__(this).createProcessingInstruction(importedNode.target, importedNode.data);
        } else if (importedNode.nodeType == Node.COMMENT_NODE) {
            // create a local Comment (with the same data as the importedNode)
            importNode = __ownerDocument__(this).createComment(importedNode.data);
        } else {  // throw Exception if nodeType is not supported
            throw(new DOMException(DOMException.NOT_SUPPORTED_ERR));
        }

        if (deep) {
            // recurse childNodes
            for(i = 0; i < importedNode.childNodes.length; i++) {
                importNode.appendChild(__ownerDocument__(this).importNode(importedNode.childNodes.item(i), true));
            }
        }

        //reset importing
        __ownerDocument__(this).importing = false;
        return importNode;

    },
    contains : function(node){
        while(node && node != this ){
            node = node.parentNode;
        }
        return !!node;
    },
    compareDocumentPosition : function(b){
        //console.log("comparing document position %s %s", this, b);
        var i,
            length,
            a = this,
            parent,
            aparents,
            bparents;
        //handle a couple simpler case first
        if(a === b) {
            return Node.DOCUMENT_POSITION_EQUAL;
        }
        if(a.ownerDocument !== b.ownerDocument) {
            return Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC|
               Node.DOCUMENT_POSITION_FOLLOWING|
               Node.DOCUMENT_POSITION_DISCONNECTED;
        }
        if(a.parentNode === b.parentNode){
            length = a.parentNode.childNodes.length;
            for(i=0;i<length;i++){
                if(a.parentNode.childNodes[i] === a){
                    return Node.DOCUMENT_POSITION_FOLLOWING;
                }else if(a.parentNode.childNodes[i] === b){
                    return Node.DOCUMENT_POSITION_PRECEDING;
                }
            }
        }

        if(a.contains(b)) {
            return Node.DOCUMENT_POSITION_CONTAINED_BY|
                   Node.DOCUMENT_POSITION_FOLLOWING;
        }
        if(b.contains(a)) {
            return Node.DOCUMENT_POSITION_CONTAINS|
                   Node.DOCUMENT_POSITION_PRECEDING;
        }
        aparents = [];
        parent = a.parentNode;
        while(parent){
            aparents[aparents.length] = parent;
            parent = parent.parentNode;
        }

        bparents = [];
        parent = b.parentNode;
        while(parent){
            i = aparents.indexOf(parent);
            if(i < 0){
                bparents[bparents.length] = parent;
                parent = parent.parentNode;
            }else{
                //i cant be 0 since we already checked for equal parentNode
                if(bparents.length > aparents.length){
                    return Node.DOCUMENT_POSITION_FOLLOWING;
                }else if(bparents.length < aparents.length){
                    return Node.DOCUMENT_POSITION_PRECEDING;
                }else{
                    //common ancestor diverge point
                    if (i === 0) {
                        return Node.DOCUMENT_POSITION_FOLLOWING;
                    } else {
                        parent = aparents[i-1];
                    }
                    return parent.compareDocumentPosition(bparents.pop());
                }
            }
        }

        return Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC|
               Node.DOCUMENT_POSITION_DISCONNECTED;

    },
    toString : function() {
        return '[object Node]';
    }

});



/**
 * @method __getElementsByTagNameRecursive__ - implements getElementsByTagName()
 * @param  elem     : Element  - The element which are checking and then recursing into
 * @param  tagname  : string      - The name of the tag to match on. The special value "*" matches all tags
 * @param  nodeList : NodeList - The accumulating list of matching nodes
 *
 * @return : NodeList
 */
var __getElementsByTagNameRecursive__ = function (elem, tagname, nodeList) {

    if (elem.nodeType == Node.ELEMENT_NODE || elem.nodeType == Node.DOCUMENT_NODE) {

        if(elem.nodeType !== Node.DOCUMENT_NODE &&
            ((elem.nodeName.toUpperCase() == tagname.toUpperCase()) ||
                (tagname == "*")) ){
            // add matching node to nodeList
            __appendChild__(nodeList, elem);
        }

        // recurse childNodes
        for(var i = 0; i < elem.childNodes.length; i++) {
            nodeList = __getElementsByTagNameRecursive__(elem.childNodes.item(i), tagname, nodeList);
        }
    }

    return nodeList;
};

/**
 * @method __getElementsByTagNameNSRecursive__
 *      implements getElementsByTagName()
 *
 * @param  elem     : Element  - The element which are checking and then recursing into
 * @param  namespaceURI : string - the namespace URI of the required node
 * @param  localName    : string - the local name of the required node
 * @param  nodeList     : NodeList - The accumulating list of matching nodes
 *
 * @return : NodeList
 */
var __getElementsByTagNameNSRecursive__ = function(elem, namespaceURI, localName, nodeList) {
    if (elem.nodeType == Node.ELEMENT_NODE || elem.nodeType == Node.DOCUMENT_NODE) {

        if (((elem.namespaceURI == namespaceURI) || (namespaceURI == "*")) &&
            ((elem.localName == localName) || (localName == "*"))) {
            // add matching node to nodeList
            __appendChild__(nodeList, elem);
        }

        // recurse childNodes
        for(var i = 0; i < elem.childNodes.length; i++) {
            nodeList = __getElementsByTagNameNSRecursive__(
                elem.childNodes.item(i), namespaceURI, localName, nodeList);
        }
    }

    return nodeList;
};

/**
 * @method __isAncestor__ - returns true if node is ancestor of target
 * @param  target         : Node - The node we are using as context
 * @param  node         : Node - The candidate ancestor node
 * @return : boolean
 */
var __isAncestor__ = function(target, node) {
    // if this node matches, return true,
    // otherwise recurse up (if there is a parentNode)
    return ((target == node) || ((target.parentNode) && (__isAncestor__(target.parentNode, node))));
};



var __recursivelyGatherText__ = function(aNode) {
    var accumulateText = "",
        idx,
        node;
    for (idx=0;idx < aNode.childNodes.length;idx++){
        node = aNode.childNodes.item(idx);
        if(node.nodeType == Node.TEXT_NODE)
            accumulateText += node.data;
        else
            accumulateText += __recursivelyGatherText__(node);
    }
    return accumulateText;
};

/**
 * function __escapeXML__
 * @param  str : string - The string to be escaped
 * @return : string - The escaped string
 */
var escAmpRegEx = /&(?!(amp;|lt;|gt;|quot|apos;))/g;
var escLtRegEx = /</g;
var escGtRegEx = />/g;
var quotRegEx = /"/g;
var aposRegEx = /'/g;

function __escapeXML__(str) {
    str = str.replace(escAmpRegEx, "&amp;").
            replace(escLtRegEx, "&lt;").
            replace(escGtRegEx, "&gt;").
            replace(quotRegEx, "&quot;").
            replace(aposRegEx, "&apos;");

    return str;
};

/*
function __escapeHTML5__(str) {
    str = str.replace(escAmpRegEx, "&amp;").
            replace(escLtRegEx, "&lt;").
            replace(escGtRegEx, "&gt;");

    return str;
};
function __escapeHTML5Atribute__(str) {
    str = str.replace(escAmpRegEx, "&amp;").
            replace(escLtRegEx, "&lt;").
            replace(escGtRegEx, "&gt;").
            replace(quotRegEx, "&quot;").
            replace(aposRegEx, "&apos;");

    return str;
};
*/

/**
 * function __unescapeXML__
 * @param  str : string - The string to be unescaped
 * @return : string - The unescaped string
 */
var unescAmpRegEx = /&amp;/g;
var unescLtRegEx = /&lt;/g;
var unescGtRegEx = /&gt;/g;
var unquotRegEx = /&quot;/g;
var unaposRegEx = /&apos;/g;
function __unescapeXML__(str) {
    str = str.replace(unescAmpRegEx, "&").
            replace(unescLtRegEx, "<").
            replace(unescGtRegEx, ">").
            replace(unquotRegEx, "\"").
            replace(unaposRegEx, "'");

    return str;
};

