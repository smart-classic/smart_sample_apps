
/**
 * @todo: document
 */

__extend__(HTMLFrameElement.prototype,{

    /*get contentDocument(){
        return this.contentWindow?
            this.contentWindow.document:
            null;
    },*/	
    set src(value){
        var event;
        this.setAttribute('src', value);
		//only load if we are already appended to the dom
        if (this.parentNode && value && value.length > 0){
            console.log('loading frame via set src %s', value);
            Envjs.loadFrame(this, Envjs.uri(value, this.ownerDocument?this.ownerDocument.location+'':null));

			//DUPLICATED IN src/platform/core/event.js (Envjs.exchangeHTMLDocument)
            /*console.log('event frame load %s', value);
            event = this.ownerDocument.createEvent('HTMLEvents');
            event.initEvent("load", false, false);
            this.dispatchEvent( event, false );*/
        }
    }

});
HTMLIFrameElement.prototype.contentDocument = HTMLFrameElement.prototype.contentDocument;
HTMLIFrameElement.prototype.src = HTMLFrameElement.prototype.src;

