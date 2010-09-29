
/**
 * HTMLTextAreaElement - DOM Level 2
 * HTML5: 4.10.11 The textarea element
 * http://dev.w3.org/html5/spec/Overview.html#the-textarea-element
 */
HTMLTextAreaElement = function(ownerDocument) {
    HTMLInputAreaCommon.apply(this, arguments);
    this._rawvalue = null;
};
HTMLTextAreaElement.prototype = new HTMLInputAreaCommon();
__extend__(HTMLTextAreaElement.prototype, {
    get cols(){
        return Number(this.getAttribute('cols')||'-1');
    },
    set cols(value){
        this.setAttribute('cols', value);
    },
    get rows(){
        return Number(this.getAttribute('rows')||'-1');
    },
    set rows(value){
        this.setAttribute('rows', value);
    },

    /*
     * read-only
     */
    get type() {
        return this.getAttribute('type') || 'textarea';
    },

    /**
     * This modifies the text node under the widget
     */
    get defaultValue() {
        return this.textContent;
    },
    set defaultValue(value) {
        this.textContent = value;
    },

    /**
     * http://dev.w3.org/html5/spec/Overview.html#concept-textarea-raw-value
     */
    get value() {
        return (this._rawvalue === null) ? this.defaultValue : this._rawvalue;
    },
    set value(value) {
        this._rawvalue = value;
    },
    toString: function() {
        return '[object HTMLTextAreaElement]';
    }
});

// Named Element Support
HTMLElement.registerSetAttribute('TEXTAREA', 'name',
                                 __updateFormForNamedElement__);
