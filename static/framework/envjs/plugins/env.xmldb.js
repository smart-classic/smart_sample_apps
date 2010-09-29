/**
 * @author thatcher
 */
load('lib/env.rhino.js');
load('lib/jquery-1.4.2.js');
load('local_settings.js');

function get_count(){
    var count = -1;
    $.ajax({
        url:XMLDB_HHH_DUMP,
        contentType:'text/plain',
        dataType:'text',
        type:'get',
        data:{
            _query: 'count(/collection/document)',
            _wrap: false
        },
        async: false,
        success: function(howmany){
            count = Number(howmany);
            console.log('xml collection has %s docs', count);
        }
    });
    return count;
};

function get_document_id(i){
    var id;
    $.ajax({
        url:XMLDB_HHH_DUMP,
        contentType:'application/xml',
        dataType:'xml',
        type:'get',
        data:{
            _query: '/collection/document/document_id',
            _howmany: 1,
            _wrap: false,
            _start: i
        },
        async: false,
        success: function(xml){
            id = $(xml).text();
            console.log('document %s id %s', i ,id);
        }
    });
    return id;
};

function copy_document(i, id){
    // we arent manipulating the xml, just moving it around to
    // another part of the xmldb to reduce the overall collection
    // file size
    var xml_text;
    $.ajax({
        url:XMLDB_HHH_DUMP,
        contentType:'text/plain',
        dataType:'text',
        type:'get',
        data:{
            _query: '/collection/document',
            _howmany: 1,
            _wrap: false,
            _start: i
        },
        async: false,
        success: function(text){
            xml_text = text;
            console.log('copying document to %s', id);
        }
    });

    $.ajax({
        url:XMLDB_HHH + id,
        contentType:'text/xml',
        dataType:'text',
        type:'put',
        data: xml_text,
        async: false,
        processData: false,
        success: function(){
            console.log('copied document to %s', id);
        },
        error: function(xhr, status, e){
            console.log('failed to copy %s %s', id, e);
        }
    });
};

$(function(){

    var count = get_count(),
        current_id;
    
    // now crawl our xmldb
    for(var i = 1; i <= count; i++){
        try{
            current_id = get_document_id(i);
            copy_document(i, current_id);
        }catch(e){
            console.log('failed to copy document %s \n %s', i, e);
        }
    }
    

});

window.location = 'http://localhost:8001/eup/';
