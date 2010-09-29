/*
 * HTMLCollection
 *
 * HTML5 -- 2.7.2.1 HTMLCollection
 * http://dev.w3.org/html5/spec/Overview.html#htmlcollection
 * http://dev.w3.org/html5/spec/Overview.html#collections
 */
HTMLCollection = function(nodelist, type) {

    __setArray__(this, []);
    var n;
    for (var i=0; i<nodelist.length; i++) {
        this[i] = nodelist[i];
        n = nodelist[i].name;
        if (n) {
            this[n] = nodelist[i];
        }
        n = nodelist[i].id;
        if (n) {
            this[n] = nodelist[i];
        }
    }

    this.length = nodelist.length;
};

HTMLCollection.prototype = {

    item: function (idx) {
        return  ((idx >= 0) && (idx < this.length)) ? this[idx] : null;
    },

    namedItem: function (name) {
        return this[name] || null;
    },

    toString: function() {
        return '[object HTMLCollection]';
    }
};
