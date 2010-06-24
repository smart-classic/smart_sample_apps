
/**
 * @name KeyboardEvents
 * @w3c:domlevel 2 
 * @uri http://www.w3.org/TR/2000/REC-DOM-Level-2-Events-20001113/events.html
 */
var KeyboardEvents= function(){};
KeyboardEvents.prototype = {
    onkeydown: function(event){
        __eval__(this.getAttribute('onkeydown')||'', this);
    },
    onkeypress: function(event){
        __eval__(this.getAttribute('onkeypress')||'', this);
    },
    onkeyup: function(event){
        __eval__(this.getAttribute('onkeyup')||'', this);
    }
};


var __registerKeyboardEventAttrs__ = function(elm){
    if(elm.hasAttribute('onkeydown')){ 
        elm.addEventListener('keydown', elm.onkeydown, false); 
    }
    if(elm.hasAttribute('onkeypress')){ 
        elm.addEventListener('keypress', elm.onkeypress, false); 
    }
    if(elm.hasAttribute('onkeyup')){ 
        elm.addEventListener('keyup', elm.onkeyup, false); 
    }
    return elm;
};

//HTMLInputElement, HTMLSelectElement, HTMLTextAreaElement
var  __keydown__ = function(element){
    var event = new Event('KeyboardEvents');
    event.initEvent("keydown", false, false);
    element.dispatchEvent(event);
};

//HTMLInputElement, HTMLSelectElement, HTMLTextAreaElement
var  __keypress__ = function(element){
    var event = new Event('KeyboardEvents');
    event.initEvent("keypress", false, false);
    element.dispatchEvent(event);
};

//HTMLInputElement, HTMLSelectElement, HTMLTextAreaElement
var  __keyup__ = function(element){
    var event = new Event('KeyboardEvents');
    event.initEvent("keyup", false, false);
    element.dispatchEvent(event);
};
