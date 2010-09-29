
/*
 * HTMLFormElement - DOM Level 2
 *
 * HTML5: http://dev.w3.org/html5/spec/Overview.html#the-form-element
 */
HTMLFormElement = function(ownerDocument){
    HTMLElement.apply(this, arguments);

    //TODO: on __elementPopped__ from the parser
    //      we need to determine all the forms default
    //      values
};
HTMLFormElement.prototype = new HTMLElement();
__extend__(HTMLFormElement.prototype,{
    get acceptCharset(){
        return this.getAttribute('accept-charset');
    },
    set acceptCharset(acceptCharset) {
        this.setAttribute('accept-charset', acceptCharset);
    },
    get action() {
        return this.getAttribute('action');
    },
    set action(action){
        this.setAttribute('action', action);
    },

    get enctype() {
        return this.getAttribute('enctype');
    },
    set enctype(enctype) {
        this.setAttribute('enctype', enctype);
    },
    get method() {
        return this.getAttribute('method');
    },
    set method(method) {
        this.setAttribute('method', method);
    },
    get name() {
        return this.getAttribute("name");
    },
    set name(val) {
        return this.setAttribute("name",val);
    },
    get target() {
        return this.getAttribute("target");
    },
    set target(val) {
        return this.setAttribute("target",val);
    },

    /**
     * "Named Elements"
     *
     */
    /**
     * returns HTMLFormControlsCollection
     * http://dev.w3.org/html5/spec/Overview.html#dom-form-elements
     *
     * button fieldset input keygen object output select textarea
     */
    get elements() {
        var nodes = this.getElementsByTagName('*');
        var alist = [];
        var i, tmp;
        for (i = 0; i < nodes.length; ++i) {
            nodename = nodes[i].nodeName;
            // would like to replace switch with something else
            //  since it's redundant with the SetAttribute callbacks
            switch (nodes[i].nodeName) {
            case 'BUTTON':
            case 'FIELDSET':
            case 'INPUT':
            case 'KEYGEN':
            case 'OBJECT':
            case 'OUTPUT':
            case 'SELECT':
            case 'TEXTAREA':
                alist.push(nodes[i]);
                this[i] = nodes[i];
                tmp = nodes[i].name;
                if (tmp) {
                    this[tmp] = nodes[i];
                }
                tmp = nodes[i].id;
                if (tmp) {
                    this[tmp] = nodes[i];
                }
            }
        }
        return new HTMLCollection(alist);
    },
    _updateElements: function() {
        this.elements;
    },
    get length() {
        return this.elements.length;
    },
    item: function(idx) {
        return this.elements[idx];
    },
    namedItem: function(aname) {
        return this.elements.namedItem(aname);
    },
    toString: function() {
        return '[object HTMLFormElement]';
    },
    submit: function() {
        //TODO: this needs to perform the form inputs serialization
        //      and submission
        //  DONE: see xhr/form.js
        var event = __submit__(this);

    },
    reset: function() {
        //TODO: this needs to reset all values specified in the form
        //      to those which where set as defaults
        __reset__(this);

    },
    onsubmit: HTMLEvents.prototype.onsubmit,
    onreset: HTMLEvents.prototype.onreset
});
