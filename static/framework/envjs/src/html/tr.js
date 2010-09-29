
/**
 * HTMLRowElement - DOM Level 2
 * Implementation Provided by Steven Wood
 *
 * HTML5: 4.9.8 The tr element
 * http://dev.w3.org/html5/spec/Overview.html#the-tr-element
 */
HTMLTableRowElement = function(ownerDocument) {
    HTMLElement.apply(this, arguments);
};
HTMLTableRowElement.prototype = new HTMLElement();
__extend__(HTMLTableRowElement.prototype, {

    /*appendChild : function (child) {

      var retVal = Node.prototype.appendChild.apply(this, arguments);
      retVal.cellIndex = this.cells.length -1;

      return retVal;
      },*/
    // align gets or sets the horizontal alignment of data within cells of the row.
    get align() {
        return this.getAttribute("align");
    },

    get bgColor() {
        return this.getAttribute("bgcolor");
    },

    get cells() {
        var nl = this.getElementsByTagName("td");
        return new HTMLCollection(nl);
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

    /**
     * http://dev.w3.org/html5/spec/Overview.html#dom-tr-rowindex
     */
    get rowIndex() {
        var nl = this.parentNode.childNodes;
        for (var i=0; i<nl.length; i++) {
            if (nl[i] === this) {
                return i;
            }
        }
        return -1;
    },

    /**
     * http://dev.w3.org/html5/spec/Overview.html#dom-tr-sectionrowindex
     */
    get sectionRowIndex() {
        var nl = this.parentNode.getElementsByTagName(this.tagName);
        for (var i=0; i<nl.length; i++) {
            if (nl[i] === this) {
                return i;
            }
        }
        return -1;
    },

    get vAlign () {
        return this.getAttribute("vAlign");
    },

    insertCell : function (idx) {
        if (idx === undefined) {
            throw new Error("Index omitted in call to HTMLTableRow.insertCell");
        }

        var numCells = this.cells.length,
        node = null;

        if (idx > numCells) {
            throw new Error("Index > rows.length in call to HTMLTableRow.insertCell");
        }

        var cell = document.createElement("td");

        if (idx === -1 || idx === numCells) {
            this.appendChild(cell);
        } else {


            node = this.firstChild;

            for (var i=0; i<idx; i++) {
                node = node.nextSibling;
            }
        }

        this.insertBefore(cell, node);
        cell.cellIndex = idx;

        return cell;
    },
    deleteCell : function (idx) {
        var elem = this.cells[idx];
        this.removeChild(elem);
    },
    toString: function() {
        return '[object HTMLTableRowElement]';
    }

});
