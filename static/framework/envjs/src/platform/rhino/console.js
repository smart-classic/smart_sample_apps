
/**
 * Writes message to system out.
 *
 * Some sites redefine 'print' as in 'window.print', so instead of
 * printing to stdout, you are popping open a new window, which might
 * call print, etc, etc,etc This can cause infinite loops and can
 * exhausing all memory.
 *
 * By defining this upfront now, Envjs.log will always call the native 'print'
 * function
 *
 * @param {Object} message
 */
Envjs.log = print;

Envjs.lineSource = function(e){
    return e&&e.rhinoException?e.rhinoException.lineSource():"(line ?)";
};
