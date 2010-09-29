
/**
 * @name MouseEvent
 * @w3c:domlevel 2 
 * @uri http://www.w3.org/TR/2000/REC-DOM-Level-2-Events-20001113/events.html
 */
MouseEvent = function(options) {
    this._screenX= 0;
    this._screenY= 0;
    this._clientX= 0;
    this._clientY= 0;
    this._ctrlKey= false;
    this._metaKey= false;
    this._altKey= false;
    this._button= null;
    this._relatedTarget= null;
};
MouseEvent.prototype = new UIEvent();
__extend__(MouseEvent.prototype,{
    get screenX(){
        return this._screenX;
    },
    get screenY(){
        return this._screenY;
    },
    get clientX(){
        return this._clientX;
    },
    get clientY(){
        return this._clientY;
    },
    get ctrlKey(){
        return this._ctrlKey;
    },
    get altKey(){
        return this._altKey;
    },
    get shiftKey(){
        return this._shiftKey;
    },
    get metaKey(){
        return this._metaKey;
    },
    get button(){
        return this._button;
    },
    get relatedTarget(){
        return this._relatedTarget;
    },
    initMouseEvent: function(type, bubbles, cancelable, windowObject, detail,
            screenX, screenY, clientX, clientY, ctrlKey, altKey, shiftKey, 
            metaKey, button, relatedTarget){
        this.initUIEvent(type, bubbles, cancelable, windowObject, detail);
        this._screenX = screenX;
        this._screenY = screenY;
        this._clientX = clientX;
        this._clientY = clientY;
        this._ctrlKey = ctrlKey;
        this._altKey = altKey;
        this._shiftKey = shiftKey;
        this._metaKey = metaKey;
        this._button = button;
        this._relatedTarget = relatedTarget;
    }
});
