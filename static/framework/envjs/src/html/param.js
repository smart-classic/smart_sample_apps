
/**
 * HTMLParamElement
 *
 * HTML5: 4.8.6 The param element
 * http://dev.w3.org/html5/spec/Overview.html#the-param-element
 */
HTMLParamElement = function(ownerDocument) {
    HTMLElement.apply(this, arguments);
};
HTMLParamElement.prototype = new HTMLElement();
__extend__(HTMLParamElement.prototype, {
    get name() {
        return this.getAttribute('name') || '';
    },
    set name(value) {
        this.setAttribute('name', value);
    },
    get type(){
        return this.getAttribute('type');
    },
    set type(value){
        this.setAttribute('type',value);
    },
    get value(){
        return this.getAttribute('value');
    },
    set value(value){
        this.setAttribute('value',value);
    },
    get valueType(){
        return this.getAttribute('valuetype');
    },
    set valueType(value){
        this.setAttribute('valuetype',value);
    },
    toString: function() {
        return '[object HTMLParamElement]';
    }
});

