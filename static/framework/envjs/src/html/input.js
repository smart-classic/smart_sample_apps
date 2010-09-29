/**
 * HTMLInputElement
 *
 * HTML5: 4.10.5 The input element
 * http://dev.w3.org/html5/spec/Overview.html#the-input-element
 */
HTMLInputElement = function(ownerDocument) {
    HTMLInputAreaCommon.apply(this, arguments);
    this._dirty = false;
    this._checked = null;
    this._value = null;
};
HTMLInputElement.prototype = new HTMLInputAreaCommon();
__extend__(HTMLInputElement.prototype, {
    get alt(){
        return this.getAttribute('alt') || '';
    },
    set alt(value){
        this.setAttribute('alt', value);
    },

    /**
     * 'checked' returns state, NOT the value of the attribute
     */
    get checked(){
        if (this._checked === null) {
            this._checked = this.defaultChecked;
        }
        return this._checked;
    },
    set checked(value){
        // force to boolean value
        this._checked = (value) ? true : false;
    },

    /**
     * 'defaultChecked' actually reflects if the 'checked' attribute
     * is present or not
     */
    get defaultChecked(){
        return this.hasAttribute('checked');
    },
    set defaultChecked(val){
        if (val) {
            this.setAttribute('checked', '');
        } else {
            if (this.defaultChecked) {
                this.removeAttribute('checked');
            }
        }
    },
    get defaultValue() {
        return this.getAttribute('value') || '';
    },
    set defaultValue(value) {
        this._dirty = true;
        this.setAttribute('value', value);
    },
    get value() {
        return (this._value === null) ? this.defaultValue : this._value;
    },
    set value(newvalue) {
        this._value = newvalue;
    },
    /**
     * Height is a string
     */
    get height(){
        // spec says it is a string
        return this.getAttribute('height') || '';
    },
    set height(value){
        this.setAttribute('height',value);
    },

    /**
     * MaxLength is a number
     */
    get maxLength(){
        return Number(this.getAttribute('maxlength')||'-1');
    },
    set maxLength(value){
        this.setAttribute('maxlength', value);
    },

    /**
     * Src is a URL string
     */
    get src(){
        return this.getAttribute('src') || '';
    },
    set src(value){
        // TODO: make absolute any relative URLS
        this.setAttribute('src', value);
    },

    get type() {
        return this.getAttribute('type') || 'text';
    },
    set type(value) {
        this.setAttribute('type', value);
    },

    get useMap(){
        return this.getAttribute('map') || '';
    },

    /**
     * Width: spec says it is a string
     */
    get width(){
        return this.getAttribute('width') || '';
    },
    set width(value){
        this.setAttribute('width',value);
    },
    click:function(){
        __click__(this);
    },
    toString: function() {
        return '[object HTMLInputElement]';
    }
});

//http://dev.w3.org/html5/spec/Overview.html#dom-input-value
// if someone directly modifies the value attribute, then the input's value
// also directly changes.
HTMLElement.registerSetAttribute('INPUT', 'value', function(node, value) {
    if (!node._dirty) {
        node._value = value;
        node._dirty = true;
    }
});

/*
 *The checked content attribute is a boolean attribute that gives the
 *default checkedness of the input element. When the checked content
 *attribute is added, if the control does not have dirty checkedness,
 *the user agent must set the checkedness of the element to true; when
 *the checked content attribute is removed, if the control does not
 *have dirty checkedness, the user agent must set the checkedness of
 *the element to false.
 */
// Named Element Support
HTMLElement.registerSetAttribute('INPUT', 'name',
                                 __updateFormForNamedElement__);
