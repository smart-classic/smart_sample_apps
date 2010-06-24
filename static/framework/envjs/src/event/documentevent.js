/**
 * 
 * // Introduced in DOM Level 2:
 * interface DocumentEvent {
 *   Event createEvent (in DOMString eventType) 
 *      raises (DOMException);
 * };
 */
DocumentEvent = function(){};
DocumentEvent.prototype.createEvent = function(eventType){
    //console.debug('createEvent(%s)', eventType); 
    switch (eventType){
        case 'Events':
            return new Event(); 
            break;
        case 'HTMLEvents':
            return new Event(); 
            break;
        case 'UIEvents':
            return new UIEvent();
            break;
        case 'MouseEvents':
            return new MouseEvent();
            break;
        case 'KeyEvents':
            return new KeyboardEvent();
            break;
        case 'KeyboardEvent':
            return new KeyboardEvent();
            break;
        case 'MutationEvents':
            return new MutationEvent();
            break;
        default:
            throw(new DOMException(DOMException.NOT_SUPPORTED_ERR));
    }
};

Document.prototype.createEvent = DocumentEvent.prototype.createEvent;
