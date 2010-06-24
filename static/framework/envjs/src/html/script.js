
/** 
 * HTMLScriptElement - DOM Level 2
 */
HTMLScriptElement = function(ownerDocument) {
    HTMLElement.apply(this, arguments);
};
HTMLScriptElement.prototype = new HTMLElement;
__extend__(HTMLScriptElement.prototype, {
    get text(){
        // text of script is in a child node of the element
        // scripts with < operator must be in a CDATA node
        for (var i=0; i<this.childNodes.length; i++) {
            if (this.childNodes[i].nodeType == Node.CDATA_SECTION_NODE) {
                return this.childNodes[i].nodeValue;
            }
        } 
        // otherwise there will be a text node containing the script
        if (this.childNodes[0] && this.childNodes[0].nodeType == Node.TEXT_NODE) {
            return this.childNodes[0].nodeValue;
 		}
        return this.nodeValue;

    },
    set text(value){
        this.nodeValue = value;
        Envjs.loadInlineScript(this);
    },
    get htmlFor(){
        return this.getAttribute('for');
    },
    set htmlFor(value){
        this.setAttribute('for',value);
    },
    get event(){
        return this.getAttribute('event');
    },
    set event(value){
        this.setAttribute('event',value);
    },
    get charset(){
        return this.getAttribute('charset');
    },
    set charset(value){
        this.setAttribute('charset',value);
    },
    get defer(){
        return this.getAttribute('defer');
    },
    set defer(value){
        this.setAttribute('defer',value);
    },
    get src(){
        return this.getAttribute('src')||'';
    },
    set src(value){
        this.setAttribute('src',value);
    },
    get type(){
        return this.getAttribute('type')||'';
    },
    set type(value){
        this.setAttribute('type',value);
    },
    onload: HTMLEvents.prototype.onload,
    onerror: HTMLEvents.prototype.onerror
});

