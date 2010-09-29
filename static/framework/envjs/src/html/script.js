
/**
 * HTMLScriptElement - DOM Level 2
 *
 * HTML5: 4.3.1 The script element
 * http://dev.w3.org/html5/spec/Overview.html#script
 */
HTMLScriptElement = function(ownerDocument) {
    HTMLElement.apply(this, arguments);
};
HTMLScriptElement.prototype = new HTMLElement();
__extend__(HTMLScriptElement.prototype, {

    /**
     * HTML5 spec @ http://dev.w3.org/html5/spec/Overview.html#script
     *
     * "The IDL attribute text must return a concatenation of the
     * contents of all the text nodes that are direct children of the
     * script element (ignoring any other nodes such as comments or
     * elements), in tree order. On setting, it must act the same way
     * as the textContent IDL attribute."
     *
     * AND... "The term text node refers to any Text node,
     * including CDATASection nodes; specifically, any Node with node
     * type TEXT_NODE (3) or CDATA_SECTION_NODE (4)"
     */
    get text() {
        var kids = this.childNodes;
        var kid;
        var s = '';
        var imax = kids.length;
        for (var i = 0; i < imax; ++i) {
            kid = kids[i];
            if (kid.nodeType === Node.TEXT_NODE ||
                kid.nodeType === Node.CDATA_SECTION_NODE) {
                s += kid.nodeValue;
            }
        }
        return s;
    },

    /**
     * HTML5 spec "Can be set, to replace the element's children with
     * the given value."
     */
    set text(value) {
        // this deletes all children, and make a new single text node
        // with value
        this.textContent = value;

        /* Currently we always execute, but this isn't quite right if
         * the node has *not* been inserted into the document, then it
         * should *not* fire.  The more detailed answer from the spec:
         *
         * When a script element that is neither marked as having
         * "already started" nor marked as being "parser-inserted"
         * experiences one of the events listed in the following list,
         * the user agent must synchronously run the script element:
         *
         *   * The script element gets inserted into a document.
         *   * The script element is in a Document and its child nodes
         *     are changed.
         *   * The script element is in a Document and has a src
         *     attribute set where previously the element had no such
         *     attribute.
         *
         * And no doubt there are other cases as well.
         */
        Envjs.loadInlineScript(this);
    },

    get htmlFor(){
        return this.getAttribute('for');
    },
    set htmlFor(value){
        this.setAttribute('for',value);
    },
    get event(){
        return this.getAttribute('event');
    },
    set event(value){
        this.setAttribute('event',value);
    },
    get charset(){
        return this.getAttribute('charset');
    },
    set charset(value){
        this.setAttribute('charset',value);
    },
    get defer(){
        return this.getAttribute('defer');
    },
    set defer(value){
        this.setAttribute('defer',value);
    },
    get src(){
        return this.getAttribute('src')||'';
    },
    set src(value){
        this.setAttribute('src',value);
    },
    get type(){
        return this.getAttribute('type')||'';
    },
    set type(value){
        this.setAttribute('type',value);
    },
    onload: HTMLEvents.prototype.onload,
    onerror: HTMLEvents.prototype.onerror,
    toString: function() {
        return '[object HTMLScriptElement]';
    }
});

