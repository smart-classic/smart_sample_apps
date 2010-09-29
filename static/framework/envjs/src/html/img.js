
/**
 * HTMLImageElement and Image
 */


HTMLImageElement = function(ownerDocument) {
    HTMLElement.apply(this, arguments);
};
HTMLImageElement.prototype = new HTMLElement();
__extend__(HTMLImageElement.prototype, {
    get alt(){
        return this.getAttribute('alt');
    },
    set alt(value){
        this.setAttribute('alt', value);
    },
    get height(){
        return parseInt(this.getAttribute('height'), 10) || 0;
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
        return this.getAttribute('src') || '';
    },
    set src(value){
        this.setAttribute('src', value);
    },
    get width(){
        return parseInt(this.getAttribute('width'), 10) || 0;
    },
    set width(value){
        this.setAttribute('width', value);
    },
    toString: function(){
        return '[object HTMLImageElement]';
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
    this.width = parseInt(width, 10) || 0;
    this.height = parseInt(height, 10) || 0;
    this.nodeName = 'IMG';
};
Image.prototype = new HTMLImageElement();


/*
 * Image.src attribute events.
 *
 * Not sure where this should live... in events/img.js? in parser/img.js?
 * Split out to make it easy to move.
 */

/**
 * HTMLImageElement && Image are a bit odd in that the 'src' attribute
 * is 'active' -- changing it triggers loading of the image from the
 * network.
 *
 * This can occur by
 *   - Directly setting the Image.src =
 *   - Using one of the Element.setAttributeXXX methods
 *   - Node.importNode an image
 *   - The initial creation and parsing of an <img> tag
 *
 * __onImageRequest__ is a function that handles eventing
 *  and dispatches to a user-callback.
 *
 */
__loadImage__ = function(node, value) {
    var event;
    if (value && (!Envjs.loadImage ||
                  (Envjs.loadImage &&
                   Envjs.loadImage(node, value)))) {
        // value has to be something (easy)
        // if the user-land API doesn't exist
        // Or if the API exists and it returns true, then ok:
        event = document.createEvent('Events');
        event.initEvent('load');
    } else {
        // oops
        event = document.createEvent('Events');
        event.initEvent('error');
    }
    node.dispatchEvent(event, false);
};

__extend__(HTMLImageElement.prototype, {
    onload: function(event){
        __eval__(this.getAttribute('onload') || '', this);
    }
});


/*
 * Image Loading
 *
 * The difference between "owner.parsing" and "owner.fragment"
 *
 * If owner.parsing === true, then during the html5 parsing then,
 *  __elementPopped__ is called when a compete tag (with attrs and
 *  children) is full parsed and added the DOM.
 *
 *   For images, __elementPopped__ is called with everything the
 *    tag has.  which in turn looks for a "src" attr and calls
 *    __loadImage__
 *
 * If owner.parser === false (or non-existant), then we are not in
 * a parsing step.  For images, perhaps someone directly modified
 * a 'src' attribute of an existing image.
 *
 * 'innerHTML' is tricky since we first create a "fake document",
 *  parse it, then import the right parts.  This may call
 *  img.setAttributeNS twice.  once during the parse and once
 *  during the clone of the node.  We want event to trigger on the
 *  later and not during th fake doco.  "owner.fragment" is set by
 *  the fake doco parser to indicate that events should not be
 *  triggered on this.
 *
 * We coud make 'owner.parser' == [ 'none', 'full', 'fragment']
 * and just use one variable That was not done since the patch is
 * quite large as is.
 *
 * This same problem occurs with scripts.  innerHTML oddly does
 * not eval any <script> tags inside.
 */
HTMLElement.registerSetAttribute('IMG', 'src', function(node, value) {
    var owner = node.ownerDocument;
    if (!owner.parsing && !owner.fragment) {
        __loadImage__(node, value);
    }
});
