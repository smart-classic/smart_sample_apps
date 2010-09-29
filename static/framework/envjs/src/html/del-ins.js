
/*
 * HTMLModElement - DOM Level 2
 * http://dev.w3.org/html5/spec/Overview.html#htmlmodelement
 */
HTMLModElement = function(ownerDocument) {
    HTMLElement.apply(this, arguments);
};
HTMLModElement.prototype = new HTMLElement();
__extend__(HTMLModElement.prototype, {
    get cite(){
        return this.getAttribute('cite');
    },
    set cite(value){
        this.setAttribute('cite', value);
    },
    get dateTime(){
        return this.getAttribute('datetime');
    },
    set dateTime(value){
        this.setAttribute('datetime', value);
    },
    toString: function() {
        return '[object HTMLModElement]';
    }
});
