
/**
 * HTMLFrameElement - DOM Level 2
 */
HTMLFrameElement = function(ownerDocument) {
    HTMLElement.apply(this, arguments);
    // this is normally a getter but we need to be
    // able to set it to correctly emulate behavior
    this.contentDocument = null;
    this.contentWindow = null;
};
HTMLFrameElement.prototype = new HTMLElement();
__extend__(HTMLFrameElement.prototype, {

    get frameBorder(){
        return this.getAttribute('border')||"";
    },
    set frameBorder(value){
        this.setAttribute('border', value);
    },
    get longDesc(){
        return this.getAttribute('longdesc')||"";
    },
    set longDesc(value){
        this.setAttribute('longdesc', value);
    },
    get marginHeight(){
        return this.getAttribute('marginheight')||"";
    },
    set marginHeight(value){
        this.setAttribute('marginheight', value);
    },
    get marginWidth(){
        return this.getAttribute('marginwidth')||"";
    },
    set marginWidth(value){
        this.setAttribute('marginwidth', value);
    },
    get name(){
        return this.getAttribute('name')||"";
    },
    set name(value){
        this.setAttribute('name', value);
    },
    get noResize(){
        return this.getAttribute('noresize')||false;
    },
    set noResize(value){
        this.setAttribute('noresize', value);
    },
    get scrolling(){
        return this.getAttribute('scrolling')||"";
    },
    set scrolling(value){
        this.setAttribute('scrolling', value);
    },
    get src(){
        return this.getAttribute('src')||"";
    },
    set src(value){
        this.setAttribute('src', value);
    },
    toString: function(){
        return '[object HTMLFrameElement]';
    },
    onload: HTMLEvents.prototype.onload
});

