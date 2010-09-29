
/*
 * HTMLCanvasElement - DOM Level 2
 * HTML5: 4.8.11 The canvas element
 * http://dev.w3.org/html5/spec/Overview.html#the-canvas-element
 */


/*
 * This is a "non-Abstract Base Class". For an implmentation that actually
 * did something, all these methods would need to over-written
 */
CanvasRenderingContext2D = function() {
    // NOP
};

var nullfunction = function() {};

CanvasRenderingContext2D.prototype = {
    addColorStop: nullfunction,
    arc: nullfunction,
    beginPath: nullfunction,
    bezierCurveTo: nullfunction,
    clearRect: nullfunction,
    clip: nullfunction,
    closePath: nullfunction,
    createLinearGradient: nullfunction,
    createPattern: nullfunction,
    createRadialGradient: nullfunction,
    drawImage: nullfunction,
    fill: nullfunction,
    fillRect:  nullfunction,
    lineTo: nullfunction,
    moveTo: nullfunction,
    quadraticCurveTo: nullfunction,
    rect: nullfunction,
    restore: nullfunction,
    rotate: nullfunction,
    save: nullfunction,
    scale: nullfunction,
    setTranform: nullfunction,
    stroke: nullfunction,
    strokeRect: nullfunction,
    transform: nullfunction,
    translate: nullfunction,

    toString: function() {
        return '[object CanvasRenderingContext2D]';
    }
};

HTMLCanvasElement = function(ownerDocument) {
    HTMLElement.apply(this, arguments);
};
HTMLCanvasElement.prototype = new HTMLElement();
__extend__(HTMLCanvasElement.prototype, {

    getContext: function(ctxtype) {
        if (ctxtype === '2d') {
            return new CanvasRenderingContext2D();
        }
        throw new Error("Unknown context type of '" + ctxtype + '"');
    },

    get height(){
        return Number(this.getAttribute('height')|| 150);
    },
    set height(value){
        this.setAttribute('height', value);
    },

    get width(){
        return Number(this.getAttribute('width')|| 300);
    },
    set width(value){
        this.setAttribute('width', value);
    },

    toString: function() {
        return '[object HTMLCanvasElement]';
    }

});

