Envjs.eval = function(context, source, name){
    __context__.evaluateString(
        context,
        source,
        name,
        0,
        null
    );
};
