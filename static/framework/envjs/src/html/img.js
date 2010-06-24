
/** 
 * HTMLImageElement - DOM Level 2
 */
HTMLImageElement = function(ownerDocument) {
    HTMLElement.apply(this, arguments);
};
HTMLImageElement.prototype = new HTMLElement;
__extend__(HTMLImageElement.prototype, {
    get alt(){
        return this.getAttribute('alt');
    },
    set alt(value){
        this.setAttribute('alt', value);
    },
    get height(){
        return parseInt(this.getAttribute('height')) || 0;
    },
    set height(value){
        this.setAttribute('height', value);
    },
    get isMap(){
        return this.hasAttribute('map');
    },
    set useMap(value){
        this.setAttribute('map', value);
    },
    get longDesc(){
        return this.getAttribute('longdesc');
    },
    set longDesc(value){
        this.setAttribute('longdesc', value);
    },
    get name(){
        return this.getAttribute('name');
    },
    set name(value){
        this.setAttribute('name', value);
    },
    get src(){
        return this.getAttribute('src');
    },
    set src(value){
        this.setAttribute('src', value);

        var event = document.createEvent();
        event.initEvent("load");
        this.dispatchEvent( event, false );
    },
    get width(){
        return parseInt(this.getAttribute('width')) || 0;
    },
    set width(value){
        this.setAttribute('width', value);
    },
    onload: function(event){
        __eval__(this.getAttribute('onload')||'', this)
    }
});


/*
 * html5 4.8.1
 * http://dev.w3.org/html5/spec/Overview.html#the-img-element
 */
Image = function(width, height) {
    // Not sure if "[global].document" satifies this requirement:
    // "The element's document must be the active document of the
    // browsing context of the Window object on which the interface
    // object of the invoked constructor is found."

    HTMLElement.apply(this, [document]);
    // Note: firefox will throw an error if the width/height
    //   is not an integer.  Safari just converts to 0 on error.
    this.width = parseInt(width) || 0;
    this.height = parseInt(height) || 0;
};
Image.prototype = new HTMLImageElement;

