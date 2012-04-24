//
// Get the data for the DM app
//

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

        // // testing json-ld
        // jsdata = { '@graph': [] };
        // demos.graph
        //      .where('?s ?p ?o')
        //      .each(function(i, bindings, triples){
        //        // note: this.s == bindings.s == triples[0].subject
        //        if (i>0) {
        //          // .dump() returns RDF/JSON representation
        //          console.log('s: ', this.s.dump().value, ' (', this.s.dump().type, ')');
        //          console.log('p: ', this.p.dump().value, ' (', this.p.dump().type, ')');
        //          console.log('o: ', this.o.dump().value, ' (', this.o.dump().type, ')', '\n');
        //
        //          // jstriple = {
        //          //   '@id': this.s.dump().value,
        //          //   ''
        //          // };
        //          // debugger;
        //        }
        //      })

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

var LAB_RESULTS_get = function(){
  return $.Deferred(function(dfd){
    SMART.LAB_RESULTS_get()
      .success(function(r){
        // LDL Codes
        //
        // LOINC Code, Long name, Short Name, class, rank # of 2000
        // 13457-7	Cholesterol in LDL [Mass/volume] in Serum or Plasma by calculation	LDLc SerPl Calc-mCnc	CHEM	63
        // 2089-1	Cholesterol in LDL [Mass/volume] in Serum or Plasma	LDLc SerPl-mCnc	CHEM	92
        // 18262-6	Cholesterol in LDL [Mass/volume] in Serum or Plasma by Direct assay	LDLc SerPl Direct Assay-mCnc	CHEM	249
        // Other possible codes (unused): 12773‐8, 18261‐8, 22748‐8, 24331‐1, 39469‐2, 49132‐4

        // FIXME: code is for wbc # bld NOT LDL!!
        ldl_array = [];
        r.graph
         .prefix('rdf',     'http://www.w3.org/1999/02/22-rdf-syntax-ns#')
         .prefix('sp',      'http://smartplatforms.org/terms#')
         .prefix('dcterms', 'http://purl.org/dc/terms/')
         .where('?lr  rdf:type              sp:LabResult')
         .where('?lr  sp:labName            ?bn1')
         .where('?bn1 sp:code               <http://purl.bioontology.org/ontology/LNC/26464-8>')
         .where('?lr  sp:quantitativeResult ?bn2')
         .where('?bn2 rdf:type              sp:QuantitativeResult')
         .where('?bn2 sp:valueAndUnit       ?bn3')
         .where('?bn3 rdf:type              sp:ValueAndUnit')
         .where('?bn3 sp:value              ?value')
         .where('?bn3 sp:unit               ?unit')
         .where('?lr  sp:specimenCollected  ?bn4')
         .where('?bn4 sp:startDate          ?date')
         .each(function(){
           ldl_array.push({
             'value': this.value.value,
             'unit':  this.unit.value,
             'date':  this.date.value
           })
         })

         dfd.resolve();
      })
      .error(error_callback);
  }).promise();
};

// On SMART.ready, do all the data api calls and synchronize
// when they are all complete.
SMART.ready(function(){
  $.when(
         ALLERGIES_get()
       , DEMOGRAPHICS_get()
       , VITAL_SIGNS_get()
       , LAB_RESULTS_get()
       // , MEDS_get()
       // , NOTES_get()
       // , PROBLEMS_get()
       // , VITAL_SIGNS_get()
  )
  .then(function(){

    $('#family_name').text(pt.family_name.value)
    $('#given_name').text(pt.given_name.value)
    $('#record_id').text(SMART.record.id)
    $('#birthday').text(pt.bday.value)
    var b = new XDate(pt.bday.value)
    $('#age').text(Math.round(b.diffYears(new XDate())));
    $('#gender').text(pt.gender.value[0])

    // testing flot
    var x_min = new XDate('2010').valueOf();
    var x_max = new XDate().valueOf()

    var flot_options_bp = {
      xaxis: {
        mode: 'time',
        timeformat: '%y',
        min: x_min,
        max: x_max,
        tickSize: [1, 'year'],
        minTickSize: [1, 'year']
        // tickLength: 0
      },
      yaxis: {
        min: 50,
        max: 200,
        ticks: [50, 100, 150, 200],
        tickLength: 0
      },
      series: {
        lines: {
          show: false
        },
        points: {
          show: true
        }
      },
      grid: {
        // dark gray rbg(204, 204, 204)  #cccccc
        // light gray rbg(235, 235, 235) #ebebeb
        // color: '#ebebeb',
        backgroundColor: '#ebebeb',
        borderWidth: 1,
        markings: [
          { yaxis: { from: 80, to: 80 }, color: "#ccc" },
          { yaxis: { from: 130, to: 130 }, color: "#ccc" }
        ]
      }
    }

    // alter the options for the other two graphs
    var flot_options_ldl = $.extend(true, {}, flot_options_bp);
    var flot_options_a1c = $.extend(true, {}, flot_options_bp);

    flot_options_ldl.yaxis = {
      min: 0,
      max: 200,
      ticks: [0, 50, 100, 150, 200],
      tickLength: 0
    }

    flot_options_ldl.grid = {
      backgroundColor: '#ebebeb',
      borderWidth: 1,
      markings: [
        { yaxis: { from: 200, to: 100 }, color: "#ccc" },
      ]
    }

    flot_options_a1c.yaxis = {
      min: 0,
      max: 20,
      ticks: [0, 5, 10, 15, 20],
      tickLength: 0
    }

    flot_options_a1c.grid = {
      backgroundColor: '#ebebeb',
      borderWidth: 1,
      markings: [
        { yaxis: { from: 20, to: 7 }, color: "#ccc" },
      ]
    }

    var dbp_array = [];
    var sbp_array = [];
    var ldl_array = [];
    var a1c_array = [];

    $.each(pt.dbp_array, function(i,v){
      var d = new XDate(v.date);
      dbp_array.push([d.valueOf(), Number(v.value)]);
    });

    $.each(pt.sbp_array, function(i,v){
      var d = new XDate(v.date);
      sbp_array.push([d.valueOf(), Number(v.value)]);
    });

    ldl_array = sbp_array;

    $.each(sbp_array, function(i,v){
      a1c_array.push(
        [sbp_array[i][0],
         sbp_array[i][1]/10
        ]
      );
    })

    // set the heights for the graphs and set the width
    // of the a1c graph to be the same as the other graphs
    // var w = $('#column_1').width();
    var h = 100;
    $('#bp_graph').height(h);
    $('#ldl_graph').height(h);
    $('#a1c_graph').height(h).width($('#bp_graph').width());

    var plot = $.plot($("#bp_graph"),
           [dbp_array, sbp_array],
           flot_options_bp
    );

    var plot = $.plot($("#ldl_graph"),
           [ldl_array],
           flot_options_ldl
    );

    var plot = $.plot($("#a1c_graph"),
           [a1c_array],
           flot_options_a1c
    );
  });
});
