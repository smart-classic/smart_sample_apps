
/* 
 * HTMLFormElement - DOM Level 2
 */
HTMLFormElement = function(ownerDocument){
    HTMLElement.apply(this, arguments);
    //TODO: on __elementPopped__ from the parser
    //      we need to determine all the forms default 
    //      values
};
HTMLFormElement.prototype = new HTMLElement;
__extend__(HTMLFormElement.prototype,{
    get acceptCharset(){ 
        return this.getAttribute('accept-charset');
    },
    set acceptCharset(acceptCharset){
        this.setAttribute('accept-charset', acceptCharset);
        
    },
    get action(){
        return this.getAttribute('action');
        
    },
    set action(action){
        this.setAttribute('action', action);
        
    },
    get elements() {
        return this.getElementsByTagName("*");
        
    },
    get enctype(){
        return this.getAttribute('enctype');
        
    },
    set enctype(enctype){
        this.setAttribute('enctype', enctype);
        
    },
    get length() {
        return this.elements.length;
        
    },
    get method(){
        return this.getAttribute('method');
        
    },
    set method(method){
        this.setAttribute('method', method);
        
    },
	get name() {
	    return this.getAttribute("name"); 
	    
    },
	set name(val) { 
	    return this.setAttribute("name",val); 
	    
    },
	get target() { 
	    return this.getAttribute("target"); 
	    
    },
	set target(val) { 
	    return this.setAttribute("target",val); 
	    
    },
    toString: function(){
        return '[object HTMLFormElement]';
    },
	submit:function(){
        //TODO: this needs to perform the form inputs serialization
        //      and submission
        //  DONE: see xhr/form.js
	    var event = __submit__(this);
	    
    },
	reset:function(){
        //TODO: this needs to reset all values specified in the form
        //      to those which where set as defaults
	    __reset__(this);
	    
    },
    onsubmit:HTMLEvents.prototype.onsubmit,
    onreset: HTMLEvents.prototype.onreset
});
