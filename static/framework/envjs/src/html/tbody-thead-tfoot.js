
/*
 * HTMLxElement - DOM Level 2
 * - Contributed by Steven Wood
 *
 * HTML5: 4.9.5 The tbody element
 * http://dev.w3.org/html5/spec/Overview.html#the-tbody-element
 * http://dev.w3.org/html5/spec/Overview.html#htmltablesectionelement
 */
HTMLTableSectionElement = function(ownerDocument) {
    HTMLElement.apply(this, arguments);
};
HTMLTableSectionElement.prototype = new HTMLElement();
__extend__(HTMLTableSectionElement.prototype, {

    /*appendChild : function (child) {

    // disallow nesting of these elements.
    if (child.tagName.match(/TBODY|TFOOT|THEAD/)) {
    return this.parentNode.appendChild(child);
    } else {
    return Node.prototype.appendChild.apply(this, arguments);
    }

    },*/

    get align() {
        return this.getAttribute("align");
    },

    get ch() {
        return this.getAttribute("ch");
    },

    set ch(ch) {
        this.setAttribute("ch", ch);
    },

    // ch gets or sets the alignment character for cells in a column.
    set chOff(chOff) {
        this.setAttribute("chOff", chOff);
    },

    get chOff() {
        return this.getAttribute("chOff");
    },

    get vAlign () {
        return this.getAttribute("vAlign");
    },

    get rows() {
        return new HTMLCollection(this.getElementsByTagName("tr"));
    },

    insertRow : function (idx) {
        if (idx === undefined) {
            throw new Error("Index omitted in call to HTMLTableSectionElement.insertRow ");
        }

        var numRows = this.rows.length,
        node = null;

        if (idx > numRows) {
            throw new Error("Index > rows.length in call to HTMLTableSectionElement.insertRow");
        }

        var row = document.createElement("tr");
        // If index is -1 or equal to the number of rows,
        // the row is appended as the last row. If index is omitted
        // or greater than the number of rows, an error will result
        if (idx === -1 || idx === numRows) {
            this.appendChild(row);
        } else {
            node = this.firstChild;

            for (var i=0; i<idx; i++) {
                node = node.nextSibling;
            }
        }

        this.insertBefore(row, node);

        return row;
    },

    deleteRow : function (idx) {
        var elem = this.rows[idx];
        this.removeChild(elem);
    },

    toString: function() {
        return '[object HTMLTableSectionElement]';
    }
});
