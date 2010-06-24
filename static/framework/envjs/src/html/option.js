
/**
 * HTMLOptionElement - DOM Level 2
 */
HTMLOptionElement = function(ownerDocument) {
    HTMLInputCommon.apply(this, arguments);
};
HTMLOptionElement.prototype = new HTMLInputCommon;
__extend__(HTMLOptionElement.prototype, {
    get defaultSelected(){
        return this.getAttribute('defaultSelected');
    },
    set defaultSelected(value){
        this.setAttribute('defaultSelected',value);
    },
    get index(){
        var options = this.parentNode.childNodes,
            i, index = 0;
        for(i=0; i<options.length;i++){
            if(options.nodeType === Node.ELEMENT_NODE && node.tagName === "OPTION"){
                index++;
            }
            if(this == options[i])
                return index;
        }
        return -1;
    },
    get label(){
        return this.getAttribute('label');
    },
    set label(value){
        this.setAttribute('label',value);
    },
    get selected(){
        return (this.getAttribute('selected')=='selected');
    },
    set selected(value){
        //console.log('option set selected %s', value);
        if(this.defaultSelected===null && this.selected!==null){
            this.defaultSelected = this.selected+'';
        }
        var selectedValue = (value ? 'selected' : '');
        if (this.getAttribute('selected') == selectedValue) {
            // prevent inifinite loops (option's selected modifies 
            // select's value which modifies option's selected)
            return;
        }
        //console.log('option setAttribute selected %s', selectedValue);
        this.setAttribute('selected', selectedValue);

    },
    get text(){
         return ((this.nodeValue === null) ||  (this.nodeValue ===undefined)) ?
             this.innerHTML :
             this.nodeValue;
    },
    get value(){
       //console.log('getting value on option %s %s', this.text, this.getAttribute('value'));
        return ((this.getAttribute('value') === undefined) || (this.getAttribute('value') === null)) ?
            this.text :
            this.getAttribute('value');
    },
    set value(value){
       //console.log('setting value on option');
        this.setAttribute('value',value);
    }
});

