
/**
 * StyleSheet
 * http://dev.w3.org/csswg/cssom/#stylesheet
 *
 * interface StyleSheet {
 *   readonly attribute DOMString type;
 *   readonly attribute DOMString href;
 *   readonly attribute Node ownerNode;
 *   readonly attribute StyleSheet parentStyleSheet;
 *   readonly attribute DOMString title;
 *   [PutForwards=mediaText] readonly attribute MediaList media;
 *          attribute boolean disabled;
 * };
 */
StyleSheet = function() {
}

/*
 * CSSStyleSheet
 * http://dev.w3.org/csswg/cssom/#cssstylesheet
 *
 * interface CSSStyleSheet : StyleSheet {
 *   readonly attribute CSSRule ownerRule;
 *   readonly attribute CSSRuleList cssRules;
 *   unsigned long insertRule(DOMString rule, unsigned long index);
 *   void deleteRule(unsigned long index);
 * };
 */
CSSStyleSheet = function(options){
    var $cssRules,
        $disabled = options.disabled ? options.disabled : false,
        $href = options.href ? options.href : null,
        $parentStyleSheet = options.parentStyleSheet ? options.parentStyleSheet : null,
        $title = options.title ? options.title : "",
        $type = "text/css";

    function parseStyleSheet(text){
        //$debug("parsing css");
        //this is pretty ugly, but text is the entire text of a stylesheet
        var cssRules = [];
        if (!text) {
            text = '';
        }
        text = __trim__(text.replace(/\/\*(\r|\n|.)*\*\//g,""));
        // TODO: @import
        var blocks = text.split("}");
        blocks.pop();
        var i, j, len = blocks.length;
        var definition_block, properties, selectors;
        for (i=0; i<len; i++) {
            definition_block = blocks[i].split("{");
            if (definition_block.length === 2) {
                selectors = definition_block[0].split(",");
                for (j=0; j<selectors.length; j++) {
                    cssRules.push(new CSSRule({
                        selectorText : __trim__(selectors[j]),
                        cssText      : definition_block[1]
                    }));
                }
            }
        }
        return cssRules;
    }

    $cssRules = new CSSRuleList(parseStyleSheet(options.textContent));

    return __extend__(this, {
        get cssRules(){
            return $cssRules;
        },
        get rule(){
            return $cssRules;
        },//IE - may be deprecated
        get href(){
            return $href;
        },
        get parentStyleSheet(){
            return $parentStyleSheet;
        },
        get title(){
            return $title;
        },
        get type(){
            return $type;
        },
        addRule: function(selector, style, index){/*TODO*/},
        deleteRule: function(index){/*TODO*/},
        insertRule: function(rule, index){/*TODO*/},
        //IE - may be deprecated
        removeRule: function(index){
            this.deleteRule(index);
        }
    });
};

StyleSheetList = function() {
}
StyleSheetList.prototype = new Array();
__extend__(StyleSheetList.prototype, {
    item : function(index) {
        if ((index >= 0) && (index < this.length)) {
            // bounds check
            return this[index];
        }
        return null;
    },
    toString: function() {
        return '[object StyleSheetList]';
    }
});
