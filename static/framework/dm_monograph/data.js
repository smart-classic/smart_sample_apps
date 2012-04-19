//
// Get the data for the DM app
//

$ = SMART.$
pt = {}; // Attach data properties to pt object with $.extend

var error_callback = function(e){
  alert('error '+e.status+' see console.')
  console.log(e.status);
  console.log(e.message.contentType);
  console.log(e.message.data);
  dfd.reject(e.message);
};

var ALLERGIES_get = function(){
  return $.Deferred(function(dfd){
    SMART.ALLERGIES_get()
      .success(function(r){
        var no_known_allergies_p = r.graph
          .prefix('rdf',           'http://www.w3.org/1999/02/22-rdf-syntax-ns#')
          .prefix('sp',            'http://smartplatforms.org/terms#')
          .prefix('dcterms',       'http://purl.org/dc/terms/')
          .where('?allergy_id      rdf:type                sp:AllergyExclusion')
          .where('?allergy_id      sp:allergyExclusionName ?bn')
          .where('?bn              sp:code                 ?snomed_code_uri')
          .where('?snomed_code_uri dcterms:identifier      "1602440022"')
          .length

        $.extend(pt, {'no_known_allergies_p': no_known_allergies_p})

        dfd.resolve();
      })
      .error(error_callback);
  }).promise();
};

var DEMOGRAPHICS_get = function(){
  return $.Deferred(function(dfd){
    SMART.DEMOGRAPHICS_get()
      .success(function(demos){
        $.extend(pt, demos.graph
            .prefix('foaf', 'http://xmlns.com/foaf/0.1/')
            .prefix('v',    'http://www.w3.org/2006/vcard/ns#')
            .prefix('rdf',  'http://www.w3.org/1999/02/22-rdf-syntax-ns#')
            .prefix('sp',   'http://smartplatforms.org/terms#')
            .where('?r      v:n           ?n')
            .where('?n      rdf:type      v:Name')
            .where('?n      v:given-name  ?given_name')
            .where('?n      v:family-name ?family_name')
            .where('?r      foaf:gender   ?gender')
            .where('?r      v:bday        ?bday')
            .get(0))

        pt.name = pt.n;
        dfd.resolve();
      })
      .error(error_callback);
  }).promise();
};

var VITAL_SIGNS_get = function(){
  return $.Deferred(function(dfd){
    SMART.VITAL_SIGNS_get()
      .success(function(r){
        var _get_bps = function(type) {
          var code = null;
          if (type === 'systolic') code = '<http://purl.bioontology.org/ontology/LNC/8480-6>';
          else if (type === 'diastolic') code = '<http://purl.bioontology.org/ontology/LNC/8462-4>';
          else alert('error: bp type not systolic or diastolic!');
                                                             
          r.graph
           .prefix('rdf',      'http://www.w3.org/1999/02/22-rdf-syntax-ns#')
           .prefix('sp',       'http://smartplatforms.org/terms#')
           .prefix('dcterms',  'http://purl.org/dc/terms/')
           .where('?bn         rdf:type         sp:VitalSign')
           .where('?bn         sp:vitalName     ?vital_name')
           .where('?bn         sp:value         ?value')
           .where('?bn         sp:unit          ?unit')
           .where('?vital_name sp:code          ' + code)
           .where('?bn2        sp:'+ type +'    ?bn')
           .where('?bn2        rdf:type         sp:BloodPressure')
           .where('?vital_id   sp:bloodPressure ?bn2')
           .where('?vital_id   dcterms:date     ?date')
           .each(function(){
             if (type === 'systolic') bp_array = pt.sbp_array;
             else bp_array = pt.dbp_array;

             bp_array.push({
               'value': this.value.value,
               'unit':  this.unit.value,
               'date':  this.date.value
             })
           })
        }

        // ruby style!
        pt.dbp_array = [];
        pt.sbp_array = [];
        _get_bps('systolic');
        _get_bps('diastolic')
        dfd.resolve();
      })
      .error(error_callback);
  }).promise();
};


// On SMART.ready, do all the data api calls and synchronize
// when they are all complete.

SMART.ready(function() {
    $.when(ALLERGIES_get()
         , DEMOGRAPHICS_get()
         , VITAL_SIGNS_get()
         // , MEDS_get()
         // , NOTES_get()
         // , PROBLEMS_get()
         // , VITAL_SIGNS_get()
         ).then(function() {
           // some misc data
           pt.full_name = SMART.record.full_name;
           pt.record_id = SMART.record.id;
           
      // console.log(pt.birthday.value
      //           , pt.familyName.value
      //           , pt.gender.value
      //           , pt.givenName.value
      //           , "no_known_allergies_p?"
      //           , pt.no_known_allergies_p
      //           )
    });
});

