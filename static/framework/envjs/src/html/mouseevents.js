
/**
 * @name MaouseEvents
 * @w3c:domlevel 2 
 * @uri http://www.w3.org/TR/2000/REC-DOM-Level-2-Events-20001113/events.html
 */
var MouseEvents= function(){};
MouseEvents.prototype = {
    onclick: function(event){
        __eval__(this.getAttribute('onclick')||'', this);
    },
    ondblclick: function(event){
        __eval__(this.getAttribute('ondblclick')||'', this);
    },
    onmousedown: function(event){
        __eval__(this.getAttribute('onmousedown')||'', this);
    },
    onmousemove: function(event){
        __eval__(this.getAttribute('onmousemove')||'', this);
    },
    onmouseout: function(event){
        __eval__(this.getAttribute('onmouseout')||'', this);
    },
    onmouseover: function(event){
        __eval__(this.getAttribute('onmouseover')||'', this);
    },
    onmouseup: function(event){
        __eval__(this.getAttribute('onmouseup')||'', this);
    }  
};

var __registerMouseEventAttrs__ = function(elm){
    if(elm.hasAttribute('onclick')){ 
        elm.addEventListener('click', elm.onclick, false); 
    }
    if(elm.hasAttribute('ondblclick')){ 
        elm.addEventListener('dblclick', elm.ondblclick, false); 
    }
    if(elm.hasAttribute('onmousedown')){ 
        elm.addEventListener('mousedown', elm.onmousedown, false); 
    }
    if(elm.hasAttribute('onmousemove')){ 
        elm.addEventListener('mousemove', elm.onmousemove, false); 
    }
    if(elm.hasAttribute('onmouseout')){ 
        elm.addEventListener('mouseout', elm.onmouseout, false); 
    }
    if(elm.hasAttribute('onmouseover')){ 
        elm.addEventListener('mouseover', elm.onmouseover, false); 
    }
    if(elm.hasAttribute('onmouseup')){ 
        elm.addEventListener('mouseup', elm.onmouseup, false); 
    }
    return elm;
};


var  __click__ = function(element){
    var event = new Event('MouseEvents');
    event.initEvent("click", true, true, null, 0,
                0, 0, 0, 0, false, false, false, 
                false, null, null);
    element.dispatchEvent(event);
};
var  __mousedown__ = function(element){
    var event = new Event('MouseEvents');
    event.initEvent("mousedown", true, true, null, 0,
                0, 0, 0, 0, false, false, false, 
                false, null, null);
    element.dispatchEvent(event);
};
var  __mouseup__ = function(element){
    var event = new Event('MouseEvents');
    event.initEvent("mouseup", true, true, null, 0,
                0, 0, 0, 0, false, false, false, 
                false, null, null);
    element.dispatchEvent(event);
};
var  __mouseover__ = function(element){
    var event = new Event('MouseEvents');
    event.initEvent("mouseover", true, true, null, 0,
                0, 0, 0, 0, false, false, false, 
                false, null, null);
    element.dispatchEvent(event);
};
var  __mousemove__ = function(element){
    var event = new Event('MouseEvents');
    event.initEvent("mousemove", true, true, null, 0,
                0, 0, 0, 0, false, false, false, 
                false, null, null);
    element.dispatchEvent(event);
};
var  __mouseout__ = function(element){
    var event = new Event('MouseEvents');
    event.initEvent("mouseout", true, true, null, 0,
                0, 0, 0, 0, false, false, false, 
                false, null, null);
    element.dispatchEvent(event);
};
