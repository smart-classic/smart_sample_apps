/*
 *  a set of convenience classes to centralize implementation of
 * properties and methods across multiple in-form elements
 *
 *  the hierarchy of related HTML elements and their members is as follows:
 *
 * Condensed Version
 *
 *  HTMLInputCommon
 *     * legent (no value attr)
 *     * fieldset (no value attr)
 *     * label (no value attr)
 *     * option (custom value)
 *  HTMLTypeValueInputs (extends InputCommon)
 *     * select  (custom value)
 *     * button (just sets value)
 *  HTMLInputAreaCommon (extends TypeValueIput)
 *     * input  (custom)
 *     * textarea (just sets value)
 *
 * -----------------------
 *    HTMLInputCommon:  common to all elements
 *       .form
 *
 *    <legend>
 *          [common plus:]
 *       .align
 *
 *    <fieldset>
 *          [identical to "legend" plus:]
 *       .margin
 *
 *
 *  ****
 *
 *    <label>
 *          [common plus:]
 *       .dataFormatAs
 *       .htmlFor
 *       [plus data properties]
 *
 *    <option>
 *          [common plus:]
 *       .defaultSelected
 *       .index
 *       .label
 *       .selected
 *       .text
 *       .value   // unique implementation, not duplicated
 *       .form    // unique implementation, not duplicated
 *  ****
 *
 *    HTMLTypeValueInputs:  common to remaining elements
 *          [common plus:]
 *       .name
 *       .type
 *       .value
 *       [plus data properties]
 *
 *
 *    <select>
 *       .length
 *       .multiple
 *       .options[]
 *       .selectedIndex
 *       .add()
 *       .remove()
 *       .item()                                       // unimplemented
 *       .namedItem()                                  // unimplemented
 *       [plus ".onchange"]
 *       [plus focus events]
 *       [plus data properties]
 *       [plus ".size"]
 *
 *    <button>
 *       .dataFormatAs   // duplicated from above, oh well....
 *       [plus ".status", ".createTextRange()"]
 *
 *  ****
 *
 *    HTMLInputAreaCommon:  common to remaining elements
 *       .defaultValue
 *       .readOnly
 *       .handleEvent()                                // unimplemented
 *       .select()
 *       .onselect
 *       [plus ".size"]
 *       [plus ".status", ".createTextRange()"]
 *       [plus focus events]
 *       [plus ".onchange"]
 *
 *    <textarea>
 *       .cols
 *       .rows
 *       .wrap                                         // unimplemented
 *       .onscroll                                     // unimplemented
 *
 *    <input>
 *       .alt
 *       .accept                                       // unimplemented
 *       .checked
 *       .complete                                     // unimplemented
 *       .defaultChecked
 *       .dynsrc                                       // unimplemented
 *       .height
 *       .hspace                                       // unimplemented
 *       .indeterminate                                // unimplemented
 *       .loop                                         // unimplemented
 *       .lowsrc                                       // unimplemented
 *       .maxLength
 *       .src
 *       .start                                        // unimplemented
 *       .useMap
 *       .vspace                                       // unimplemented
 *       .width
 *       .onclick
 *       [plus ".size"]
 *       [plus ".status", ".createTextRange()"]

 *    [data properties]                                // unimplemented
 *       .dataFld
 *       .dataSrc

 *    [status stuff]                                   // unimplemented
 *       .status
 *       .createTextRange()

 *    [focus events]
 *       .onblur
 *       .onfocus

 */



var inputElements_dataProperties = {};
var inputElements_status = {};

var inputElements_onchange = {
    onchange: function(event){
        __eval__(this.getAttribute('onchange')||'', this);
    }
};

var inputElements_size = {
    get size(){
        return Number(this.getAttribute('size'));
    },
    set size(value){
        this.setAttribute('size',value);
    }
};

var inputElements_focusEvents = {
    blur: function(){
        __blur__(this);

        if (this._oldValue != this.value){
            var event = document.createEvent("HTMLEvents");
            event.initEvent("change", true, true);
            this.dispatchEvent( event );
        }
    },
    focus: function(){
        __focus__(this);
        this._oldValue = this.value;
    }
};


/*
* HTMLInputCommon - convenience class, not DOM
*/
var HTMLInputCommon = function(ownerDocument) {
    HTMLElement.apply(this, arguments);
};
HTMLInputCommon.prototype = new HTMLElement();
__extend__(HTMLInputCommon.prototype, {
    get form() {
        // parent can be null if element is outside of a form
        // or not yet added to the document
        var parent = this.parentNode;
        while (parent && parent.nodeName.toLowerCase() !== 'form') {
            parent = parent.parentNode;
        }
        return parent;
    },
    get accessKey(){
        return this.getAttribute('accesskey');
    },
    set accessKey(value){
        this.setAttribute('accesskey',value);
    },
    get access(){
        return this.getAttribute('access');
    },
    set access(value){
        this.setAttribute('access', value);
    },
    get disabled(){
        return (this.getAttribute('disabled') === 'disabled');
    },
    set disabled(value){
        this.setAttribute('disabled', (value ? 'disabled' :''));
    }
});




/*
* HTMLTypeValueInputs - convenience class, not DOM
*/
var HTMLTypeValueInputs = function(ownerDocument) {

    HTMLInputCommon.apply(this, arguments);

    this._oldValue = "";
};
HTMLTypeValueInputs.prototype = new HTMLInputCommon();
__extend__(HTMLTypeValueInputs.prototype, inputElements_size);
__extend__(HTMLTypeValueInputs.prototype, inputElements_status);
__extend__(HTMLTypeValueInputs.prototype, inputElements_dataProperties);
__extend__(HTMLTypeValueInputs.prototype, {
    get name(){
        return this.getAttribute('name')||'';
    },
    set name(value){
        this.setAttribute('name',value);
    },
});


/*
* HTMLInputAreaCommon - convenience class, not DOM
*/
var HTMLInputAreaCommon = function(ownerDocument) {
    HTMLTypeValueInputs.apply(this, arguments);
};
HTMLInputAreaCommon.prototype = new HTMLTypeValueInputs();
__extend__(HTMLInputAreaCommon.prototype, inputElements_focusEvents);
__extend__(HTMLInputAreaCommon.prototype, inputElements_onchange);
__extend__(HTMLInputAreaCommon.prototype, {
    get readOnly(){
        return (this.getAttribute('readonly')=='readonly');
    },
    set readOnly(value){
        this.setAttribute('readonly', (value ? 'readonly' :''));
    },
    select:function(){
        __select__(this);

    }
});


var __updateFormForNamedElement__ = function(node, value) {
    if (node.form) {
        // to check for ID or NAME attribute too
        // not, then nothing to do
        node.form._updateElements();
    }
};
