/*
 * CSS2Properties - DOM Level 2 CSS
 * Renamed to CSSStyleDeclaration??
 */

var __toCamelCase__ = function(name) {
    if (name) {
        return name.replace(/\-(\w)/g, function(all, letter) {
            return letter.toUpperCase();
        });
    }
    return name;
};

var __toDashed__ = function(camelCaseName) {
    if (camelCaseName) {
        return camelCaseName.replace(/[A-Z]/g, function(all) {
            return '-' + all.toLowerCase();
        });
    }
    return camelCaseName;
};

CSS2Properties = function(element){
    //console.log('css2properties %s', __cssproperties__++);
    this.styleIndex = __supportedStyles__;//non-standard
    this.type = element.tagName;//non-standard
    __setArray__(this, []);
    __cssTextToStyles__(this, element.cssText || '');
};
__extend__(CSS2Properties.prototype, {
    get cssText() {
        var i, css = [];
        for (i = 0; i < this.length; ++i) {
            css.push(this[i] + ': ' + this.getPropertyValue(this[i]) + ';');
        }
        return css.join(' ');
    },
    set cssText(cssText) {
        __cssTextToStyles__(this, cssText);
    },
    getPropertyCSSValue: function(name) {
        //?
    },
    getPropertyPriority: function() {

    },
    getPropertyValue: function(name) {
        var index, cname = __toCamelCase__(name);
        if (cname in this.styleIndex) {
            return this[cname];
        } else {
            index = Array.prototype.indexOf.apply(this, [name]);
            if (index > -1) {
                return this[index];
            }
        }
        return null;
    },
    item: function(index) {
        return this[index];
    },
    removeProperty: function(name) {
        this.styleIndex[name] = null;
        name = __toDashed__(name);
        var index = Array.prototype.indexOf.apply(this, [name]);
        if (index > -1) {
            Array.prototype.splice.apply(this, [1,index]);
        }
    },
    setProperty: function(name, value, priority) {
        var nval;
        name = __toCamelCase__(name);
        if (value !== undefined && name in this.styleIndex) {
            // NOTE:  parseFloat('300px') ==> 300  no
            // NOTE:  Number('300px') ==> Nan      yes
            nval = Number(value);
            this.styleIndex[name] = isNaN(nval) ? value : nval;
            name = __toDashed__(name);
            if (Array.prototype.indexOf.apply(this, [name]) === -1 ){
                Array.prototype.push.apply(this,[name]);
            }
        }
    },
    toString: function() {
        return '[object CSS2Properties]';
    }
});



var __cssTextToStyles__ = function(css2props, cssText) {
    //console.log('__cssTextToStyles__ %s %s', css2props, cssText);
    //var styleArray=[];
    var i, style, styles = cssText.split(';');
    for (i = 0; i < styles.length; ++i) {
        style = styles[i].split(':');
        if (style.length === 2) {
            css2props.setProperty(style[0].replace(' ', '', 'g'),
                                  style[1].replace(' ', '', 'g'));
        }
    }
};

//Obviously these arent all supported but by commenting out various
//sections this provides a single location to configure what is
//exposed as supported.
var __supportedStyles__ = {
    azimuth:                null,
    background:             null,
    backgroundAttachment:   null,
    backgroundColor:        'rgb(0,0,0)',
    backgroundImage:        null,
    backgroundPosition:     null,
    backgroundRepeat:       null,
    border:                 null,
    borderBottom:           null,
    borderBottomColor:      null,
    borderBottomStyle:      null,
    borderBottomWidth:      null,
    borderCollapse:         null,
    borderColor:            null,
    borderLeft:             null,
    borderLeftColor:        null,
    borderLeftStyle:        null,
    borderLeftWidth:        null,
    borderRight:            null,
    borderRightColor:       null,
    borderRightStyle:       null,
    borderRightWidth:       null,
    borderSpacing:          null,
    borderStyle:            null,
    borderTop:              null,
    borderTopColor:         null,
    borderTopStyle:         null,
    borderTopWidth:         null,
    borderWidth:            null,
    bottom:                 null,
    captionSide:            null,
    clear:                  null,
    clip:                   null,
    color:                  null,
    content:                null,
    counterIncrement:       null,
    counterReset:           null,
    cssFloat:               null,
    cue:                    null,
    cueAfter:               null,
    cueBefore:              null,
    cursor:                 null,
    direction:              'ltr',
    display:                null,
    elevation:              null,
    emptyCells:             null,
    font:                   null,
    fontFamily:             null,
    fontSize:               '1em',
    fontSizeAdjust:         null,
    fontStretch:            null,
    fontStyle:              null,
    fontVariant:            null,
    fontWeight:             null,
    height:                 '',
    left:                   null,
    letterSpacing:          null,
    lineHeight:             null,
    listStyle:              null,
    listStyleImage:         null,
    listStylePosition:      null,
    listStyleType:          null,
    margin:                 null,
    marginBottom:           '0px',
    marginLeft:             '0px',
    marginRight:            '0px',
    marginTop:              '0px',
    markerOffset:           null,
    marks:                  null,
    maxHeight:              null,
    maxWidth:               null,
    minHeight:              null,
    minWidth:               null,
    opacity:                1,
    orphans:                null,
    outline:                null,
    outlineColor:           null,
    outlineOffset:          null,
    outlineStyle:           null,
    outlineWidth:           null,
    overflow:               null,
    overflowX:              null,
    overflowY:              null,
    padding:                null,
    paddingBottom:          '0px',
    paddingLeft:            '0px',
    paddingRight:           '0px',
    paddingTop:             '0px',
    page:                   null,
    pageBreakAfter:         null,
    pageBreakBefore:        null,
    pageBreakInside:        null,
    pause:                  null,
    pauseAfter:             null,
    pauseBefore:            null,
    pitch:                  null,
    pitchRange:             null,
    position:               null,
    quotes:                 null,
    richness:               null,
    right:                  null,
    size:                   null,
    speak:                  null,
    speakHeader:            null,
    speakNumeral:           null,
    speakPunctuation:       null,
    speechRate:             null,
    stress:                 null,
    tableLayout:            null,
    textAlign:              null,
    textDecoration:         null,
    textIndent:             null,
    textShadow:             null,
    textTransform:          null,
    top:                    null,
    unicodeBidi:            null,
    verticalAlign:          null,
    visibility:             '',
    voiceFamily:            null,
    volume:                 null,
    whiteSpace:             null,
    widows:                 null,
    width:                  '1px',
    wordSpacing:            null,
    zIndex:                 1
};

var __displayMap__ = {
    DIV      : 'block',
    P        : 'block',
    A        : 'inline',
    CODE     : 'inline',
    PRE      : 'block',
    SPAN     : 'inline',
    TABLE    : 'table',
    THEAD    : 'table-header-group',
    TBODY    : 'table-row-group',
    TR       : 'table-row',
    TH       : 'table-cell',
    TD       : 'table-cell',
    UL       : 'block',
    LI       : 'list-item'
};

for (var style in __supportedStyles__) {
    if (__supportedStyles__.hasOwnProperty(style)) {
        (function(name) {
            if (name === 'width' || name === 'height') {
                CSS2Properties.prototype.__defineGetter__(name, function() {
                    if (this.display === 'none'){
                        return '0px';
                    }
                    return this.styleIndex[name];
                });
            } else if (name === 'display') {
                //display will be set to a tagName specific value if ''
                CSS2Properties.prototype.__defineGetter__(name, function() {
                    var val = this.styleIndex[name];
                    val = val ? val :__displayMap__[this.type];
                    return val;
                });
            } else {
                CSS2Properties.prototype.__defineGetter__(name, function() {
                    return this.styleIndex[name];
                });
            }
            CSS2Properties.prototype.__defineSetter__(name, function(value) {
                this.setProperty(name, value);
            });
        }(style));
    }
}
