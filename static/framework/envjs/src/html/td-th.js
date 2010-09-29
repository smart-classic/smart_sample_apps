
/**
 * HTMLTableCellElement
 * base interface for TD and TH
 *
 * HTML5: 4.9.11 Attributes common to td and th elements
 * http://dev.w3.org/html5/spec/Overview.html#htmltablecellelement
 */
HTMLTableCellElement = function(ownerDocument) {
    HTMLElement.apply(this, arguments);
};
HTMLTableCellElement.prototype = new HTMLElement();
__extend__(HTMLTableCellElement.prototype, {


    // TOOD: attribute unsigned long  colSpan;
    // TODO: attribute unsigned long  rowSpan;
    // TODO: attribute DOMString      headers;
    // TODO: readonly attribute long  cellIndex;

    // Not really necessary but might be helpful in debugging
    toString: function() {
        return '[object HTMLTableCellElement]';
    }

});

/**
 * HTMLTableDataCellElement
 * HTML5: 4.9.9 The td Element
 * http://dev.w3.org/html5/spec/Overview.html#the-td-element
 */
HTMLTableDataCellElement = function(ownerDocument) {
    HTMLElement.apply(this, arguments);
};
HTMLTableDataCellElement.prototype = new HTMLTableCellElement();
__extend__(HTMLTableDataCellElement.prototype, {

    // adds no new properties or methods

    toString: function() {
        return '[object HTMLTableDataCellElement]';
    }
});

/**
 * HTMLTableHeaderCellElement
 * HTML5: 4.9.10 The th Element
 * http://dev.w3.org/html5/spec/Overview.html#the-th-element
 */
HTMLTableHeaderCellElement = function(ownerDocument) {
    HTMLElement.apply(this, arguments);
};
HTMLTableHeaderCellElement.prototype = new HTMLTableCellElement();
__extend__(HTMLTableHeaderCellElement.prototype, {

    // TODO:  attribute DOMString scope

    toString: function() {
        return '[object HTMLTableHeaderCellElement]';
    }
});

