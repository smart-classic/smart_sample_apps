/**
 * @class Event
 */
Event = function(options){
    // event state is kept read-only by forcing
    // a new object for each event.  This may not
    // be appropriate in the long run and we'll
    // have to decide if we simply dont adhere to
    // the read-only restriction of the specification
    this._bubbles = true;
    this._cancelable = true;
    this._cancelled = false;
    this._currentTarget = null;
    this._target = null;
    this._eventPhase = Event.AT_TARGET;
    this._timeStamp = new Date().getTime();
    this._preventDefault = false;
    this._stopPropogation = false;
};

__extend__(Event.prototype,{
    get bubbles(){return this._bubbles;},
    get cancelable(){return this._cancelable;},
    get currentTarget(){return this._currentTarget;},
    set currentTarget(currentTarget){ this._currentTarget = currentTarget; },
    get eventPhase(){return this._eventPhase;},
    set eventPhase(eventPhase){this._eventPhase = eventPhase;},
    get target(){return this._target;},
    set target(target){ this._target = target;},
    get timeStamp(){return this._timeStamp;},
    get type(){return this._type;},
    initEvent: function(type, bubbles, cancelable){
        this._type=type?type:'';
        this._bubbles=!!bubbles;
        this._cancelable=!!cancelable;
    },
    preventDefault: function(){
        this._preventDefault = true;
    },
    stopPropagation: function(){
        if(this._cancelable){
            this._cancelled = true;
            this._bubbles = false;
        }
    },
    get cancelled(){
        return this._cancelled;
    },
    toString: function(){
        return '[object Event]';
    }
});

__extend__(Event,{
    CAPTURING_PHASE : 1,
    AT_TARGET       : 2,
    BUBBLING_PHASE  : 3
});


