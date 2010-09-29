
/*
* HTMLTableColElement - DOM Level 2
*
* HTML5: 4.9.3 The colgroup element
* http://dev.w3.org/html5/spec/Overview.html#the-colgroup-element
*/
HTMLTableColElement = function(ownerDocument) {
    HTMLElement.apply(this, arguments);
};
HTMLTableColElement.prototype = new HTMLElement();
__extend__(HTMLTableColElement.prototype, {
    get align(){
        return this.getAttribute('align');
    },
    set align(value){
        this.setAttribute('align', value);
    },
    get ch(){
        return this.getAttribute('ch');
    },
    set ch(value){
        this.setAttribute('ch', value);
    },
    get chOff(){
        return this.getAttribute('ch');
    },
    set chOff(value){
        this.setAttribute('ch', value);
    },
    get span(){
        return this.getAttribute('span');
    },
    set span(value){
        this.setAttribute('span', value);
    },
    get vAlign(){
        return this.getAttribute('valign');
    },
    set vAlign(value){
        this.setAttribute('valign', value);
    },
    get width(){
        return this.getAttribute('width');
    },
    set width(value){
        this.setAttribute('width', value);
    },
    toString: function() {
        return '[object HTMLTableColElement]';
    }
});

