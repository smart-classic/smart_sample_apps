
/**
 * HTMLOptGroupElement - DOM Level 2
 * HTML 5: 4.10.9 The optgroup element
 * http://dev.w3.org/html5/spec/Overview.html#the-optgroup-element
 */
HTMLOptGroupElement = function(ownerDocument) {
    HTMLElement.apply(this, arguments);
};
HTMLOptGroupElement.prototype = new HTMLElement();
__extend__(HTMLOptGroupElement.prototype, {
    get disabled(){
        return this.getAttribute('disabled');
    },
    set disabled(value){
        this.setAttribute('disabled',value);
    },
    get label(){
        return this.getAttribute('label');
    },
    set label(value){
        this.setAttribute('label',value);
    },
    appendChild: function(node){
        var i,
        length,
        selected = false;
        //make sure at least one is selected by default
        if(node.nodeType === Node.ELEMENT_NODE && node.tagName === 'OPTION'){
            length = this.childNodes.length;
            for(i=0;i<length;i++){
                if(this.childNodes[i].nodeType === Node.ELEMENT_NODE &&
                   this.childNodes[i].tagName === 'OPTION'){
                    //check if it is selected
                    if(this.selected){
                        selected = true;
                        break;
                    }
                }
            }
            if(!selected){
                node.selected = true;
                this.value = node.value?node.value:'';
            }
        }
        return HTMLElement.prototype.appendChild.apply(this, [node]);
    },
    toString: function() {
        return '[object HTMLOptGroupElement]';
    }
});
