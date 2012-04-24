//
// Get the data for the DM app
//
// pt's with LDL (13457-7) and a1c (4548-4)
// p1272431 Stephan Graham, p967332 William Robinson


pt = {}; // Attach data properties to pt object

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
        var d = demos.graph
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
                     .get(0)

        pt.family_name = d.family_name.value;
        pt.given_name = d.given_name.value;
        pt.gender = d.gender.value;
        pt.bday = d.bday.value;

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

             bp_array.push([
               new XDate(this.date.value).valueOf(),
               Number(this.value.value)
             ])
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

        // FIXME: ONLY top LDL code!!
        pt.ldl_array = [];
        r.graph
         .prefix('rdf',     'http://www.w3.org/1999/02/22-rdf-syntax-ns#')
         .prefix('sp',      'http://smartplatforms.org/terms#')
         .prefix('dcterms', 'http://purl.org/dc/terms/')
         .where('?lr  rdf:type              sp:LabResult')
         .where('?lr  sp:labName            ?bn1')
         .where('?bn1 sp:code               <http://purl.bioontology.org/ontology/LNC/13457-7>')
         .where('?lr  sp:quantitativeResult ?bn2')
         .where('?bn2 rdf:type              sp:QuantitativeResult')
         .where('?bn2 sp:valueAndUnit       ?bn3')
         .where('?bn3 rdf:type              sp:ValueAndUnit')
         .where('?bn3 sp:value              ?value')
         .where('?bn3 sp:unit               ?unit')
         .where('?lr  sp:specimenCollected  ?bn4')
         .where('?bn4 sp:startDate          ?date')
         .each(function(){

           // FIXME: hack push all dates + 3 years
           var d = new XDate(this.date.value)
           d.addYears(3, true);

           pt.ldl_array.push([
             d.valueOf(),
             Number(this.value.value)
           ])
         })

         pt.ldl_latest = _.chain(pt.ldl_array)
                          .sortBy(function(item){ return item[0]; })
                          .last()
                          .value() || null

         // A1C Codes
         //
         // LOINC Code, Long name, Short Name, class, rank # of 2000
         // 4548-4,Hemoglobin A1c/Hemoglobin.total in Blood,Hgb A1c MFr Bld,HEM/BC,81
         // 17856-6,Hemoglobin A1c/Hemoglobin.total in Blood by HPLC,Hgb A1c MFr Bld HPLC,HEM/BC,215

         // FIXME: ONLY top A1c code!!
         pt.a1c_array = [];
         r.graph
          .prefix('rdf',     'http://www.w3.org/1999/02/22-rdf-syntax-ns#')
          .prefix('sp',      'http://smartplatforms.org/terms#')
          .prefix('dcterms', 'http://purl.org/dc/terms/')
          .where('?lr  rdf:type              sp:LabResult')
          .where('?lr  sp:labName            ?bn1')
          .where('?bn1 sp:code               <http://purl.bioontology.org/ontology/LNC/4548-4>')
          .where('?lr  sp:quantitativeResult ?bn2')
          .where('?bn2 rdf:type              sp:QuantitativeResult')
          .where('?bn2 sp:valueAndUnit       ?bn3')
          .where('?bn3 rdf:type              sp:ValueAndUnit')
          .where('?bn3 sp:value              ?value')
          .where('?bn3 sp:unit               ?unit')
          .where('?lr  sp:specimenCollected  ?bn4')
          .where('?bn4 sp:startDate          ?date')
          .each(function(){

            // FIXME: hack push all dates + 3 years
            var d = new XDate(this.date.value)
            d.addYears(3, true);

            pt.a1c_array.push([
              d.valueOf(),
              Number(this.value.value)
            ])
          })

          pt.a1c_latest = _.chain(pt.a1c_array)
                           .sortBy(function(item){ return item[0]; })
                           .last()
                           .value() || null


          // Ur Tp
          //
          // 5804-0,Protein [Mass/volume] in Urine by Test strip,Prot Ur Strip-mCnc,UA,74
          // 2888-6,Protein [Mass/volume] in Urine,Prot Ur-mCnc,UA,292
          // 35663-4,Protein [Mass/volume] in unspecified time Urine,Prot ?Tm Ur-mCnc,UA,635
          // 21482-5,Protein [Mass/volume] in 24 hour Urine,Prot 24H Ur-mCnc,CHEM,1696

          // FIXME: ONLY top code!!
          pt.ur_tp_array = [];
          r.graph
           .prefix('rdf',     'http://www.w3.org/1999/02/22-rdf-syntax-ns#')
           .prefix('sp',      'http://smartplatforms.org/terms#')
           .prefix('dcterms', 'http://purl.org/dc/terms/')
           .where('?lr  rdf:type              sp:LabResult')
           .where('?lr  sp:labName            ?bn1')
           .where('?bn1 sp:code               <http://purl.bioontology.org/ontology/LNC/5804-0>')
           .where('?lr  sp:quantitativeResult ?bn2')
           .where('?bn2 rdf:type              sp:QuantitativeResult')
           .where('?bn2 sp:valueAndUnit       ?bn3')
           .where('?bn3 rdf:type              sp:ValueAndUnit')
           .where('?bn3 sp:value              ?value')
           .where('?bn3 sp:unit               ?unit')
           .where('?lr  sp:specimenCollected  ?bn4')
           .where('?bn4 sp:startDate          ?date')
           .each(function(){
             pt.ur_tp_array.push([
               new XDate(this.date.value).valueOf(),
               Number(this.value.value)
             ])
           })

           pt.ur_tp_latest = _.chain(pt.ur_tp_array)
                              .sortBy(function(item){ return item[0]; })
                              .last()
                              .value() || null


         // Microalbumin/Creatinine [Mass ratio] in Urine
         //
         // 14959-1,Microalbumin/Creatinine [Mass ratio] in Urine,Microalbumin/Creat Ur-mRto,CHEM,212
         // 14958-3,Microalbumin/Creatinine [Mass ratio] in 24 hour Urine,Microalbumin/Creat 24H Ur-mRto,CHEM,1979
         
         // FIXME: ONLY top code!!
         pt.micro_alb_cre_ratio_array = [];
         r.graph
          .prefix('rdf',     'http://www.w3.org/1999/02/22-rdf-syntax-ns#')
          .prefix('sp',      'http://smartplatforms.org/terms#')
          .prefix('dcterms', 'http://purl.org/dc/terms/')
          .where('?lr  rdf:type              sp:LabResult')
          .where('?lr  sp:labName            ?bn1')
          .where('?bn1 sp:code               <http://purl.bioontology.org/ontology/LNC/14959-1>')
          .where('?lr  sp:quantitativeResult ?bn2')
          .where('?bn2 rdf:type              sp:QuantitativeResult')
          .where('?bn2 sp:valueAndUnit       ?bn3')
          .where('?bn3 rdf:type              sp:ValueAndUnit')
          .where('?bn3 sp:value              ?value')
          .where('?bn3 sp:unit               ?unit')
          .where('?lr  sp:specimenCollected  ?bn4')
          .where('?bn4 sp:startDate          ?date')
          .each(function(){

            // FIXME: hack push all dates + 3 years
            var d = new XDate(this.date.value)
            d.addYears(3, true);

            pt.micro_alb_cre_ratio_array.push([
              d.valueOf(),
              Number(this.value.value)
            ])
          })

          pt.micro_alb_cre_ratio_latest = _.chain(pt.micro_alb_cre_ratio_array)
                                           .sortBy(function(item){ return item[0]; })
                                           .last()
                                           .value() || null


         // Aspartate aminotransferase / SGOT / AST
         //
         // only 1 code!! #20!!
         //
         // LOINC Code, Long name, Short Name, class, rank # of 2000
         // 1920-8,Aspartate aminotransferase [Enzymatic activity/volume] in Serum or Plasma,AST SerPl-cCnc,CHEM,19

         pt.sgot_array = [];
         r.graph
          .prefix('rdf',     'http://www.w3.org/1999/02/22-rdf-syntax-ns#')
          .prefix('sp',      'http://smartplatforms.org/terms#')
          .prefix('dcterms', 'http://purl.org/dc/terms/')
          .where('?lr  rdf:type              sp:LabResult')
          .where('?lr  sp:labName            ?bn1')
          .where('?bn1 sp:code               <http://purl.bioontology.org/ontology/LNC/1920-8>')
          .where('?lr  sp:quantitativeResult ?bn2')
          .where('?bn2 rdf:type              sp:QuantitativeResult')
          .where('?bn2 sp:valueAndUnit       ?bn3')
          .where('?bn3 rdf:type              sp:ValueAndUnit')
          .where('?bn3 sp:value              ?value')
          .where('?bn3 sp:unit               ?unit')
          .where('?lr  sp:specimenCollected  ?bn4')
          .where('?bn4 sp:startDate          ?date')
          .each(function(){

            // FIXME: hack push all dates + 3 years
            var d = new XDate(this.date.value)
            d.addYears(3, true);

            pt.sgot_array.push([
              d.valueOf(),
              Number(this.value.value)
            ])
          })

          pt.sgot_array_latest = _.chain(pt.sgot_array)
                                   .sortBy(function(item){ return item[0]; })
                                   .last()
                                   .value() || null

         // Cholesterol (total): only 1 code!!
         //
         // 2093-3,Cholesterol [Mass/volume] in Serum or Plasma,Cholest SerPl-mCnc,CHEM,32
         pt.cholesterol_total_array = [];
         r.graph
          .prefix('rdf',     'http://www.w3.org/1999/02/22-rdf-syntax-ns#')
          .prefix('sp',      'http://smartplatforms.org/terms#')
          .prefix('dcterms', 'http://purl.org/dc/terms/')
          .where('?lr  rdf:type              sp:LabResult')
          .where('?lr  sp:labName            ?bn1')
          .where('?bn1 sp:code               <http://purl.bioontology.org/ontology/LNC/2093-3>')
          .where('?lr  sp:quantitativeResult ?bn2')
          .where('?bn2 rdf:type              sp:QuantitativeResult')
          .where('?bn2 sp:valueAndUnit       ?bn3')
          .where('?bn3 rdf:type              sp:ValueAndUnit')
          .where('?bn3 sp:value              ?value')
          .where('?bn3 sp:unit               ?unit')
          .where('?lr  sp:specimenCollected  ?bn4')
          .where('?bn4 sp:startDate          ?date')
          .each(function(){

            // FIXME: hack push all dates + 3 years
            var d = new XDate(this.date.value)
            d.addYears(3, true);

            pt.cholesterol_total_array.push([
              d.valueOf(),
              Number(this.value.value)
            ])
          })

          pt.cholesterol_total_latest = _.chain(pt.cholesterol_total_array)
                                   .sortBy(function(item){ return item[0]; })
                                   .last()
                                   .value() || null

         // Tri
         //
         // 2571-8,Triglyceride [Mass/volume] in Serum or Plasma,Trigl SerPl-mCnc,CHEM,36
         // 3043-7,Triglyceride [Mass/volume] in Blood,Trigl Bld-mCnc,CHEM,1592
         
         // fixme only 1 code!

         pt.triglyceride_array = [];
         r.graph
          .prefix('rdf',     'http://www.w3.org/1999/02/22-rdf-syntax-ns#')
          .prefix('sp',      'http://smartplatforms.org/terms#')
          .prefix('dcterms', 'http://purl.org/dc/terms/')
          .where('?lr  rdf:type              sp:LabResult')
          .where('?lr  sp:labName            ?bn1')
          .where('?bn1 sp:code               <http://purl.bioontology.org/ontology/LNC/2571-8>')
          .where('?lr  sp:quantitativeResult ?bn2')
          .where('?bn2 rdf:type              sp:QuantitativeResult')
          .where('?bn2 sp:valueAndUnit       ?bn3')
          .where('?bn3 rdf:type              sp:ValueAndUnit')
          .where('?bn3 sp:value              ?value')
          .where('?bn3 sp:unit               ?unit')
          .where('?lr  sp:specimenCollected  ?bn4')
          .where('?bn4 sp:startDate          ?date')
          .each(function(){

            // FIXME: hack push all dates + 3 years
            var d = new XDate(this.date.value)
            d.addYears(3, true);

            pt.triglyceride_array.push([
              d.valueOf(),
              Number(this.value.value)
            ])
          })

          pt.triglyceride_latest = _.chain(pt.triglyceride_array)
                                   .sortBy(function(item){ return item[0]; })
                                   .last()
                                   .value() || null

         // HDL
         // 2085-9,Cholesterol in HDL [Mass/volume] in Serum or Plasma,HDLc SerPl-mCnc,CHEM,38

         pt.hdl_array = [];
         r.graph
          .prefix('rdf',     'http://www.w3.org/1999/02/22-rdf-syntax-ns#')
          .prefix('sp',      'http://smartplatforms.org/terms#')
          .prefix('dcterms', 'http://purl.org/dc/terms/')
          .where('?lr  rdf:type              sp:LabResult')
          .where('?lr  sp:labName            ?bn1')
          .where('?bn1 sp:code               <http://purl.bioontology.org/ontology/LNC/2085-9>')
          .where('?lr  sp:quantitativeResult ?bn2')
          .where('?bn2 rdf:type              sp:QuantitativeResult')
          .where('?bn2 sp:valueAndUnit       ?bn3')
          .where('?bn3 rdf:type              sp:ValueAndUnit')
          .where('?bn3 sp:value              ?value')
          .where('?bn3 sp:unit               ?unit')
          .where('?lr  sp:specimenCollected  ?bn4')
          .where('?bn4 sp:startDate          ?date')
          .each(function(){

            // FIXME: hack push all dates + 3 years
            var d = new XDate(this.date.value)
            d.addYears(3, true);

            pt.hdl_array.push([
              d.valueOf(),
              Number(this.value.value)
            ])
          })

          pt.hdl_latest = _.chain(pt.hdl_array)
                                    .sortBy(function(item){ return item[0]; })
                                    .last()
                                    .value() || null

         // BUN
         //
         // 3094-0,Urea nitrogen [Mass/volume] in Serum or Plasma,BUN SerPl-mCnc,CHEM,6
         // 6299-2,Urea nitrogen [Mass/volume] in Blood,BUN Bld-mCnc,CHEM,288

         // fixme only top code
         pt.bun_array = [];
         r.graph
          .prefix('rdf',     'http://www.w3.org/1999/02/22-rdf-syntax-ns#')
          .prefix('sp',      'http://smartplatforms.org/terms#')
          .prefix('dcterms', 'http://purl.org/dc/terms/')
          .where('?lr  rdf:type              sp:LabResult')
          .where('?lr  sp:labName            ?bn1')
          .where('?bn1 sp:code               <http://purl.bioontology.org/ontology/LNC/4548-4>')
          .where('?lr  sp:quantitativeResult ?bn2')
          .where('?bn2 rdf:type              sp:QuantitativeResult')
          .where('?bn2 sp:valueAndUnit       ?bn3')
          .where('?bn3 rdf:type              sp:ValueAndUnit')
          .where('?bn3 sp:value              ?value')
          .where('?bn3 sp:unit               ?unit')
          .where('?lr  sp:specimenCollected  ?bn4')
          .where('?bn4 sp:startDate          ?date')
          .each(function(){

            // FIXME: hack push all dates + 3 years
            var d = new XDate(this.date.value)
            d.addYears(3, true);

            pt.bun_array.push([
              d.valueOf(),
              Number(this.value.value)
            ])
          })

          pt.bun_latest = _.chain(pt.bun_latest)
                                    .sortBy(function(item){ return item[0]; })
                                    .last()
                                    .value() || null

         // Cre
         //
         // 2160-0,Creatinine [Mass/volume] in Serum or Plasma,Creat SerPl-mCnc,CHEM,1
         // 38483-4,Creatinine [Mass/volume] in Blood,Creat Bld-mCnc,CHEM,283

         // fixme only top code
         pt.creatinine_array = [];
         r.graph
          .prefix('rdf',     'http://www.w3.org/1999/02/22-rdf-syntax-ns#')
          .prefix('sp',      'http://smartplatforms.org/terms#')
          .prefix('dcterms', 'http://purl.org/dc/terms/')
          .where('?lr  rdf:type              sp:LabResult')
          .where('?lr  sp:labName            ?bn1')
          .where('?bn1 sp:code               <http://purl.bioontology.org/ontology/LNC/2160-0>')
          .where('?lr  sp:quantitativeResult ?bn2')
          .where('?bn2 rdf:type              sp:QuantitativeResult')
          .where('?bn2 sp:valueAndUnit       ?bn3')
          .where('?bn3 rdf:type              sp:ValueAndUnit')
          .where('?bn3 sp:value              ?value')
          .where('?bn3 sp:unit               ?unit')
          .where('?lr  sp:specimenCollected  ?bn4')
          .where('?bn4 sp:startDate          ?date')
          .each(function(){

            // FIXME: hack push all dates + 3 years
            var d = new XDate(this.date.value)
            d.addYears(3, true);

            pt.creatinine_array.push([
              d.valueOf(),
              Number(this.value.value)
            ])
          })

          pt.creatinine_latest = _.chain(pt.creatinine_array)
                                   .sortBy(function(item){ return item[0]; })
                                   .last()
                                   .value() || null


         // Glu
         // 2345-7,Glucose [Mass/volume] in Serum or Plasma,Glucose SerPl-mCnc,CHEM,4
         // 2339-0,Glucose [Mass/volume] in Blood,Glucose Bld-mCnc,CHEM,13

         // fixme only top code
         pt.glucose_array = [];
         r.graph
          .prefix('rdf',     'http://www.w3.org/1999/02/22-rdf-syntax-ns#')
          .prefix('sp',      'http://smartplatforms.org/terms#')
          .prefix('dcterms', 'http://purl.org/dc/terms/')
          .where('?lr  rdf:type              sp:LabResult')
          .where('?lr  sp:labName            ?bn1')
          .where('?bn1 sp:code               <http://purl.bioontology.org/ontology/LNC/2345-7>')
          .where('?lr  sp:quantitativeResult ?bn2')
          .where('?bn2 rdf:type              sp:QuantitativeResult')
          .where('?bn2 sp:valueAndUnit       ?bn3')
          .where('?bn3 rdf:type              sp:ValueAndUnit')
          .where('?bn3 sp:value              ?value')
          .where('?bn3 sp:unit               ?unit')
          .where('?lr  sp:specimenCollected  ?bn4')
          .where('?bn4 sp:startDate          ?date')
          .each(function(){

            // FIXME: hack push all dates + 3 years
            var d = new XDate(this.date.value)
            d.addYears(3, true);

            pt.glucose_array.push([
              d.valueOf(),
              Number(this.value.value)
            ])
          })

          pt.glucose_latest = _.chain(pt.glucose_array)
                                   .sortBy(function(item){ return item[0]; })
                                   .last()
                                   .value() || null

         // BUN
         //
         // 3094-0,Urea nitrogen [Mass/volume] in Serum or Plasma,BUN SerPl-mCnc,CHEM,6
         // 6299-2,Urea nitrogen [Mass/volume] in Blood,BUN Bld-mCnc,CHEM,288

         // fixme only top code
         pt.bun_array = [];
         r.graph
          .prefix('rdf',     'http://www.w3.org/1999/02/22-rdf-syntax-ns#')
          .prefix('sp',      'http://smartplatforms.org/terms#')
          .prefix('dcterms', 'http://purl.org/dc/terms/')
          .where('?lr  rdf:type              sp:LabResult')
          .where('?lr  sp:labName            ?bn1')
          .where('?bn1 sp:code               <http://purl.bioontology.org/ontology/LNC/4548-4>')
          .where('?lr  sp:quantitativeResult ?bn2')
          .where('?bn2 rdf:type              sp:QuantitativeResult')
          .where('?bn2 sp:valueAndUnit       ?bn3')
          .where('?bn3 rdf:type              sp:ValueAndUnit')
          .where('?bn3 sp:value              ?value')
          .where('?bn3 sp:unit               ?unit')
          .where('?lr  sp:specimenCollected  ?bn4')
          .where('?bn4 sp:startDate          ?date')
          .each(function(){

            // FIXME: hack push all dates + 3 years
            var d = new XDate(this.date.value)
            d.addYears(3, true);

            pt.bun_array.push([
              d.valueOf(),
              Number(this.value.value)
            ])
          })

          pt.bun_latest = _.chain(pt.bun_array)
                                   .sortBy(function(item){ return item[0]; })
                                   .last()
                                   .value() || null


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

    $('#family_name').text(pt.family_name)
    $('#given_name').text(pt.given_name)
    $('#record_id').text(SMART.record.id)
    $('#birthday').text(pt.bday)
    var b = new XDate(pt.bday)
    $('#age').text(Math.round(b.diffYears(new XDate())));
    $('#gender').text(pt.gender[0])

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

    // set the heights for the graphs and set the width
    // of the a1c graph to be the same as the other graphs
    // var w = $('#column_1').width();
    var h = 100;
    $('#bp_graph').height(h);
    $('#ldl_graph').height(h);
    $('#a1c_graph').height(h).width($('#bp_graph').width());

    // plot'em!
    $.plot($("#bp_graph"), [pt.dbp_array, pt.sbp_array], flot_options_bp);
    $.plot($("#ldl_graph"), [pt.ldl_array], flot_options_ldl);
    $.plot($("#a1c_graph"), [pt.a1c_array], flot_options_a1c);
  });
});
