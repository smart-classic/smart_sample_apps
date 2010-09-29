
/**
 * Interface KeyboardEvent (introduced in DOM Level 3)
 */
KeyboardEvent = function(options) {
    this._keyIdentifier = 0;
    this._keyLocation = 0;
    this._ctrlKey = false;
    this._metaKey = false;
    this._altKey = false;
    this._metaKey = false;
};
KeyboardEvent.prototype = new UIEvent();

__extend__(KeyboardEvent.prototype,{

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
    getModifiersState: function(keyIdentifier){

    },
    initMouseEvent: function(type, bubbles, cancelable, windowObject,
            keyIdentifier, keyLocation, modifiersList, repeat){
        this.initUIEvent(type, bubbles, cancelable, windowObject, 0);
        this._keyIdentifier = keyIdentifier;
        this._keyLocation = keyLocation;
        this._modifiersList = modifiersList;
        this._repeat = repeat;
    }
});

KeyboardEvent.DOM_KEY_LOCATION_STANDARD      = 0;
KeyboardEvent.DOM_KEY_LOCATION_LEFT          = 1;
KeyboardEvent.DOM_KEY_LOCATION_RIGHT         = 2;
KeyboardEvent.DOM_KEY_LOCATION_NUMPAD        = 3;
KeyboardEvent.DOM_KEY_LOCATION_MOBILE        = 4;
KeyboardEvent.DOM_KEY_LOCATION_JOYSTICK      = 5;


