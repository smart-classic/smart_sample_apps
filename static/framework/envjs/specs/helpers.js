// helpers available to all tests

function runningUnderEnvjs(){
    return (typeof navigator === 'object') &&
        navigator.userAgent.search( /Envjs/ ) > -1;
}
