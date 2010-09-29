/**
 * @author thatcher
 */
load('dist/env.rhino.js');
load('plugins/jquery.js');
load('local_settings.js');
load('plugins/vendor/readability.js');

Envjs.scriptTypes[""] = false;
Envjs.scriptTypes["javascript"] = false;
Envjs.scriptTypes["text/javascript"] = false;
document.async = true;

var readStyle='style-newspaper',
    readSize='size-medium',
    readMargin='margin-wide',
    start = new Date().getTime(),
    docs = {
		'http://www.cnn.com/2010/WORLD/europe/08/24/vbs.uk.afghanistan/index.html?hpt=C1':'cnn.html',
        'http://www.loc.gov/pictures/collection/bbc/background.html':'background.html'/*,
        'http://www.loc.gov/pictures/collection/bbc/bibliographies.html':'bibliographies.html',
        'http://www.loc.gov/pictures/collection/bbc/cataloging.html': 'cataloging.html',
        'http://www.loc.gov/pictures/collection/bbc/digitizing.html': 'digitizing.html',
        'http://www.loc.gov/pictures/collection/bbc/sets.html': 'sets.html',
        'http://www.loc.gov/pictures/collection/bbc/tinker_evers_chance.html': 'tinkers_evers_chance.html'*/
        /*'http://timesofindia.indiatimes.com/india/Railways-rot-as-Mamata-plays-politics-in-Bengal/articleshow/6193608.cms': '6193608.html'*/
        /*'http://www.articlesbase.com/communication-articles/difference-between-analog-and-digital-69824.html': 'article1.html'*/
    };
	
jQuery(document).ready(function(){
	console.log('document ready')
    makeReadable(name);
});
	    
jQuery.each(docs, function(doc, name){
    console.log('loading document %s', doc);
    start = new Date().getTime();
    document.location = doc;
});



function makeReadable(name){
    console.log('document ready : %s (%s)', window.location, new Date().getTime()-start);
    try{
        start = new Date().getTime();
        readability.init();
        console.log('document readable in (%s)', new Date().getTime()-start);
        $('link[rel=stylesheet], style').each(function(){
            $(this).text('').attr('href', '');
        });
        $(document.head).append('<link rel="stylesheet" href="../plugins/vendor/readability.css"/>')
        Envjs.writeToFile(
            document.documentElement.outerHTML, 
            Envjs.uri(REPORT_ROOT + name)
        );
    }catch(e){
        console.log('failed to make page readable %s', e);
    }
};
