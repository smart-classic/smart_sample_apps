/**
 * This extends HTMLElement to handle CSS-specific interfaces.
 *
 * More work / research would be needed to extend just (DOM) Element
 * for xml use and additional changes for just HTMLElement.
 */


/**
 * Replace or add  the getter for 'style'
 *
 * This could be wrapped in a closure
 */
var $css2properties = [{}];

__extend__(HTMLElement.prototype, {
    get style(){
        if ( !this.css2uuid ) {
            this.css2uuid = $css2properties.length;
            $css2properties[this.css2uuid] = new CSS2Properties(this);
        }
        return $css2properties[this.css2uuid];
    }
});

/**
 * Change for how 'setAttribute("style", ...)' works
 *
 * We are truly adding functionality to HtmlElement.setAttribute, not
 * replacing it.  So we need to save the old one first, call it, then
 * do our stuff.  If we need to do more hacks like this, HTMLElement
 * (or regular Element) needs to have a hooks array or dispatch table
 * for global changes.
 *
 * This could be wrapped in a closure if desired.
 */
var updateCss2Props = function(elem, values) {
    //console.log('__updateCss2Props__ %s %s', elem, values);
    if ( !elem.css2uuid ) {
        elem.css2uuid = $css2properties.length;
        $css2properties[elem.css2uuid] = new CSS2Properties(elem);
    }
    __cssTextToStyles__($css2properties[elem.css2uuid], values);
};

var origSetAttribute =  HTMLElement.prototype.setAttribute;

HTMLElement.prototype.setAttribute = function(name, value) {
    //console.log("CSS set attribute: " + name + ", " + value);
    origSetAttribute.apply(this, arguments);
    if (name === "style") {
        updateCss2Props(this, value);
    }
};

var origGetAttribute =  HTMLElement.prototype.getAttribute;

HTMLElement.prototype.getAttribute = function(name) {
    //console.log("CSS set attribute: " + name + ", " + value);
	var style;
    if (name === "style") {
        style = this.style.cssText;
		return style===""?null:style;
    }else{
	    return origGetAttribute.apply(this, arguments);
	}
};
