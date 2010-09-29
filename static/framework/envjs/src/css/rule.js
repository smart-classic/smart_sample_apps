
/*
 * CSSRule - DOM Level 2
 */
CSSRule = function(options) {



    var $style,
    $selectorText = options.selectorText ? options.selectorText : '';
    $style = new CSS2Properties({
        cssText: options.cssText ? options.cssText : null
    });

    return __extend__(this, {
        get style(){
            return $style;
        },
        get selectorText(){
            return $selectorText;
        },
        set selectorText(selectorText){
            $selectorText = selectorText;
        },
        toString : function(){
            return "[object CSSRule]";
        }
    });
};
CSSRule.STYLE_RULE     =  1;
CSSRule.IMPORT_RULE    =  3;
CSSRule.MEDIA_RULE     =  4;
CSSRule.FONT_FACE_RULE =  5;
CSSRule.PAGE_RULE      =  6;
//CSSRule.NAMESPACE_RULE = 10;


CSSStyleRule = function() {

};

CSSImportRule = function() {

};

CSSMediaRule = function() {

};

CSSFontFaceRule = function() {

};

CSSPageRule = function() {

};


CSSRuleList = function(data) {
    this.length = 0;
    __setArray__(this, data);
};

__extend__(CSSRuleList.prototype, {
    item : function(index) {
        if ((index >= 0) && (index < this.length)) {
            // bounds check
            return this[index];
        }
        return null;
    },
    toString: function() {
        return '[object CSSRuleList]';
    }
});
