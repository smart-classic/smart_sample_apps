
/**
 * Screen
 * @param {Object} __window__
 */

Screen = function(__window__){

    var $availHeight  = 600,
        $availWidth   = 800,
        $colorDepth   = 16,
        $pixelDepth   = 24,
        $height       = 600,
        $width        = 800,
        $top          = 0,
        $left         = 0,
        $availTop     = 0,
        $availLeft    = 0;

    __extend__( __window__, {
        moveBy : function(dx,dy){
            //TODO - modify $locals to reflect change
        },
        moveTo : function(x,y) {
            //TODO - modify $locals to reflect change
        },
        /*print : function(){
            //TODO - good global to modify to ensure print is not misused
        };*/
        resizeBy : function(dw, dh){
            __window__resizeTo($width + dw, $height + dh);
        },
        resizeTo : function(width, height){
            $width = (width <= $availWidth) ? width : $availWidth;
            $height = (height <= $availHeight) ? height : $availHeight;
        },
        scroll : function(x,y){
            //TODO - modify $locals to reflect change
        },
        scrollBy : function(dx, dy){
            //TODO - modify $locals to reflect change
        },
        scrollTo : function(x,y){
            //TODO - modify $locals to reflect change
        }
    });

    return {
        get top(){
            return $top;
        },
        get left(){
            return $left;
        },
        get availTop(){
            return $availTop;
        },
        get availLeft(){
            return $availLeft;
        },
        get availHeight(){
            return $availHeight;
        },
        get availWidth(){
            return $availWidth;
        },
        get colorDepth(){
            return $colorDepth;
        },
        get pixelDepth(){
            return $pixelDepth;
        },
        get height(){
            return $height;
        },
        get width(){
            return $width;
        }
    };
};

