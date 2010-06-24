
/**
 * Writes message to system out
 * @param {Object} message
 */
Envjs.log = function(message){
    print(message);
};

Envjs.lineSource = function(e){
    return e&&e.rhinoException?e.rhinoException.lineSource():"(line ?)";
};