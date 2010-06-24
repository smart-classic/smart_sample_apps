
/**
 * @author envjs team
 */
$css2properties = [{}];

__extend__(HTMLElement.prototype, {
    get style(){
        if ( !this.css2uuid ) {
            this.css2uuid = $css2properties.length;
            $css2properties[this.css2uuid] = new CSS2Properties(this);
        }
        return $css2properties[this.css2uuid];
    },
    setAttribute: function (name, value) {
        Element.prototype.setAttribute.apply(this,[name, value]);
        if (name === "style") {
            __updateCss2Props__(this, value);
        }
    }
});

var __updateCss2Props__ = function(elem, values){
    //console.log('__updateCss2Props__ %s %s', elem, values);
    if ( !elem.css2uuid ) {
        elem.css2uuid = $css2properties.length;
        $css2properties[elem.css2uuid] = new CSS2Properties(elem);
    }
    __cssTextToStyles__($css2properties[elem.css2uuid], values);
};
