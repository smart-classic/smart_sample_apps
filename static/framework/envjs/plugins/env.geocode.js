/**
 * @author thatcher
 */
load('dist/env.rhino.js');
load('plugins/jquery.js');



function geocode_by_title(title, id){
    
    var geocode;
            
    title = title.split(',');
    if(title.length > 3){
        title = title.slice(title.length - 4, title.length).join(',');
    }else{
        title = title.join(',');
    }
    
    $.ajax({
        url:"http://maps.google.com/maps/api/geocode/json",
        dataType:'text',
        type:'get',
        data:{
            address: title,
            sensor: false
        },
        async: false,
        success: function(json_text){
            //save it out to flat file 
            //var flat_file = Envjs.uri(DATADIR_HHH + id + '.json');
            //Envjs.writeToFile(json_text, flat_file);
            console.log('%s', json_text);
            geocode = JSON.parse(json_text);
            console.log('got geocodes for %s %s', title, geocode.status);
        }
    });
    
    return geocode;
};

$(function(){
    var current_item_title,
        current_document_id, 
        current_post;
        
    console.log('beginning geocoding of %s', PICTURES);
    //create the domain just in case its not create yet
    
    $.ajax({
        url:GEOCODES,
        contentType:'application/json',
        dataType:'json',
        type:'put',
        async: false,
        success: function(){
            console.log('created domain %s', GEOCODES);
        },
        error: function(xhr, status, e){
            console.log('failed to create domain', GEOCODES);
        },
        beforeSend: function(xhr){
            xhr.setRequestHeader('Content-Length', 0);
        }
    });
    
    
    $.ajax({
       url: PICTURES,
       async: false, 
       dataType: 'json',
       success: function(response){
           RESULTS = response.results;
       },
       error: function(xhr, status, e){
           console.log('failed to load pictures to geocode %s', e);
       }
    });
    
    // now crawl our xmldb
    for(var i = 0; i < GEOCODE_COUNT; i++){
        try{
            current_document_id = RESULTS[i].pk;
            current_item_title = RESULTS[i].title;
            geocode = geocode_by_title(
                current_item_title, 
                current_document_id
            );
            if(geocode.status == "OK"){
                // only save to json rest db if it was a successful
                // geocoding.  we have the raw response in a local
                // file anyway
                $(geocode.results).each(function(index, result){
                    current_post = {
                        $id: current_document_id+'-'+index,
                        title: current_item_title,
                        formatted_address : result.formatted_address,
                        status: "OK",
                        types: result.types,
                        latitude: result.geometry.location.lat,
                        longitude : result.geometry.location.lng,
                        location_type : result.geometry.location_type
                    };
                    current_post = JSON.stringify(current_post, null, '');
                    $.ajax({
                        url: GEOCODES + '/' + current_document_id + '-' + index,
                        contentType: 'application/json',
                        dataType:'json',
                        type:'put',
                        async: false,
                        data: current_post,
                        success: function(){
                            console.log('saved record %s', current_document_id);
                        },
                        beforeSend: function(xhr){
                            xhr.setRequestHeader('Content-Length', current_post.length);
                        }
                    });
                });
            }else if(geocode.status == "OVER_QUERY_LIMIT"){
                console.log(
                    'over query limit [start %i] [current %s]', 
                    GEOCODE_START, 
                    i
                );
                break;
            }else{
                current_post = {
                    $id: current_document_id,
                    title: current_item_title,
                    status: geocode.status
                };
                current_post = JSON.stringify(current_post, null, '');
                $.ajax({
                    url: GEOCODES + '/' + current_document_id,
                    contentType: 'application/json',
                    dataType:'json',
                    type:'put',
                    async: false,
                    data: current_post,
                    success: function(){
                        console.log('saved record %s', current_document_id);
                    },
                    beforeSend: function(xhr){
                        xhr.setRequestHeader('Content-Length', current_post.length);
                    }
                });
            }
        }catch(e){
            console.log('failed to geocode document %s \n %s', i, e);
        }
    }
    

});

var GEOCODES = 'http://localhost:8080/rest/geocodes',
    GEOCODE_START = 5,
    GEOCODE_COUNT = 100,
    RESULTS = [],
    PICTURES = 'http://www.loc.gov/pictures/collection/hh/search?q'+
        '&sp='+GEOCODE_START+
        '&c='+GEOCODE_COUNT+
        '&fo=json'+
        '&at=results';


window.location = 'http://www.loc.gov/pictures/';