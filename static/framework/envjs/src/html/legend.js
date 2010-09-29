
/**
 * HTMLLegendElement - DOM Level 2
 *
 * HTML5: 4.10.3 The legend element
 * http://dev.w3.org/html5/spec/Overview.html#the-legend-element
 */
HTMLLegendElement = function(ownerDocument) {
    HTMLInputCommon.apply(this, arguments);
};
HTMLLegendElement.prototype = new HTMLInputCommon();
__extend__(HTMLLegendElement.prototype, {
    get align(){
        return this.getAttribute('align');
    },
    set align(value){
        this.setAttribute('align',value);
    }
});

