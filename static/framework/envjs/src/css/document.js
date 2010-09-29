/*
 * Interface DocumentStyle (introduced in DOM Level 2)
 * http://www.w3.org/TR/2000/REC-DOM-Level-2-Style-20001113/stylesheets.html#StyleSheets-StyleSheet-DocumentStyle
 *
 * interface DocumentStyle {
 *   readonly attribute StyleSheetList   styleSheets;
 * };
 *
 */
__extend__(Document.prototype, {
    get styleSheets() {
        if (! this._styleSheets) {
            this._styleSheets = new StyleSheetList();
        }
        return this._styleSheets;
    }
});
