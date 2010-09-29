
/**
 * HTMLSelectElement
 * HTML5: http://dev.w3.org/html5/spec/Overview.html#the-select-element
 */
HTMLSelectElement = function(ownerDocument) {
    HTMLTypeValueInputs.apply(this, arguments);
    this._oldIndex = -1;
};

HTMLSelectElement.prototype = new HTMLTypeValueInputs();
__extend__(HTMLSelectElement.prototype, inputElements_dataProperties);
__extend__(HTMLButtonElement.prototype, inputElements_size);
__extend__(HTMLSelectElement.prototype, inputElements_onchange);
__extend__(HTMLSelectElement.prototype, inputElements_focusEvents);
__extend__(HTMLSelectElement.prototype, {

    get value() {
        var index = this.selectedIndex;
        return (index === -1) ? '' : this.options[index].value;
    },
    set value(newValue) {
        var options = this.options;
        var imax = options.length;
        for (var i=0; i< imax; ++i) {
            if (options[i].value == newValue) {
                this.setAttribute('value', newValue);
                this.selectedIndex = i;
                return;
            }
        }
    },
    get multiple() {
        return this.hasAttribute('multiple');
    },
    set multiple(value) {
        if (value) {
            this.setAttribute('multiple', '');
        } else {
            if (this.hasAttribute('multiple')) {
                this.removeAttribute('multiple');
            }
        }
    },
    // Returns HTMLOptionsCollection
    get options() {
        var nodes = this.getElementsByTagName('option');
        var alist = [];
        var i, tmp;
        for (i = 0; i < nodes.length; ++i) {
            alist.push(nodes[i]);
            this[i] = nodes[i];
            tmp = nodes[i].name;
            if (tmp) {
                this[tmp] = nodes[i];
            }
            tmp = nodes[i].id;
            if (tmp) {
                this[tmp] = nodes[i];
            }
        }
        return new HTMLCollection(alist);
    },
    get length() {
        return this.options.length;
    },
    item: function(idx) {
        return this.options[idx];
    },
    namedItem: function(aname) {
        return this.options[aname];
    },

    get selectedIndex() {
        var options = this.options;
        var imax = options.length;
        for (var i=0; i < imax; ++i) {
            if (options[i].selected) {
                //console.log('select get selectedIndex %s', i);
                return i;
            }
        }
        //console.log('select get selectedIndex %s', -1);
        return -1;
    },

    set selectedIndex(value) {
        var options = this.options;
        var num = Number(value);
        var imax = options.length;
        for (var i = 0; i < imax; ++i) {
            options[i].selected = (i === num);
        }
    },
    get type() {
        return this.multiple ? 'select-multiple' : 'select-one';
    },

    add: function(element, before) {
        this.appendChild(element);
        //__add__(this);
    },
    remove: function() {
        __remove__(this);
    },
    toString: function() {
        return '[object HTMLSelectElement]';
    }
});

// Named Element Support
HTMLElement.registerSetAttribute('SELECT', 'name',
                                 __updateFormForNamedElement__);
