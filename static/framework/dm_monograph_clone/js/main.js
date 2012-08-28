//
// main.js for Diabetes Monograph App
//
// Arjun Sanyal <arjun.sanyal@childrens.harvard.edu>
//
// Note: A good pt with a lot of data: p967332 William Robinson
//

//
// Patient Object
//
// Plain lab name implies latest result
pt = {};
pt.a1c = null;
pt.a1c_arr = [];
pt.a1c_next
pt.allergies_arr = [];
pt.bday = null;
pt.bun = null;
pt.bun_arr = [];
pt.bun_next = null;
pt.chol_total = null;
pt.chol_total_arr = [];
pt.chol_total_next = null;
pt.creatinine = null;
pt.creatinine_arr = [];
pt.creatinine_next = null;
pt.dbp = null;
pt.dbp_arr = [];
pt.dbp_next = null;
pt.family_name = null;
pt.gender = null;
pt.given_name = null;
pt.glucose = null;
pt.glucose_arr = [];
pt.glucose_next = null;
pt.hdl = null;
pt.hdl_arr = [];
pt.hdl_next = null;
pt.height = null;
pt.height_arr = [];
pt.ldl = null;
pt.ldl_arr = [];
pt.ldl_next = null;
pt.m_alb_cre_ratio = null;
pt.m_alb_cre_ratio_arr = [];
pt.m_alb_cre_ratio_next = null;
pt.meds_arr = [];
pt.problems_arr = [];
pt.reminders_arr = [];
pt.sbp = null;
pt.sbp_arr = [];
pt.sbp_next = null;
pt.sgot = null;
pt.sgot_arr = [];
pt.sgot_next = null;
pt.triglyceride = null;
pt.triglyceride_arr = [];
pt.triglyceride_next = null;
pt.ur_tp = null;
pt.ur_tp_arr = [];
pt.ur_tp_next = null;
pt.weight = null;
pt.weight_arr = [];

//
// Utility Functions
//
var error_cb = function(e){
  alert('error '+e.status+' see console.')
  console.log(e.status);
  console.log(e.message.contentType);
  console.log(e.message.data);
  dfd.reject(e.message);
};

var _round = function(val, dec){
  return Math.round(val*Math.pow(10,dec))/Math.pow(10,dec);
}


//
// Data Queries
//

// pt's with allergies: J Diaz, K Lewis, K Kelly, R Robinson
var ALLERGIES_get = function(){
  return $.Deferred(function(dfd){
    SMART.get_allergies()
      .success(function(r){
        r.graph
         .prefix('rdf', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#')
         .prefix('sp',  'http://smartplatforms.org/terms#')
         .prefix('dc',  'http://purl.org/dc/terms/')
         .where('?id    rdf:type             sp:Allergy')
         .where('?id    sp:drugClassAllergen ?bn')
         .where('?bn    dc:title             ?title')
         .where('?id    sp:allergicReaction  ?bn2')
         .where('?bn2   dc:title             ?reaction')
         .each(function(){
           pt.allergies_arr.push([
             this.title.value.toString(),
             this.reaction.value.toString()
           ])
         })

        r.graph
         .prefix('rdf', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#')
         .prefix('sp',  'http://smartplatforms.org/terms#')
         .prefix('dc',  'http://purl.org/dc/terms/')
         .where('?id    rdf:type            sp:Allergy')
         .where('?id    sp:foodAllergen     ?bn')
         .where('?bn    dc:title            ?title')
         .where('?id    sp:allergicReaction ?bn2')
         .where('?bn2   dc:title            ?reaction')
         .each(function(){
           pt.allergies_arr.push([
             this.title.value.toString(),
             this.reaction.value.toString()
           ])
         })
        dfd.resolve();
      })
      .error(error_cb);
  }).promise();
};

var MEDS_get = function(){
  return $.Deferred(function(dfd){
    SMART.get_medications()
      .success(function(r){
        r.graph
         .prefix('rdf', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#')
         .prefix('sp',  'http://smartplatforms.org/terms#')
         .prefix('dc',  'http://purl.org/dc/terms/')
         .where('?id    rdf:type        sp:Medication')
         .where('?id    sp:drugName     ?bn')
         .where('?bn    dc:title        ?title')
         .where('?id    sp:instructions ?instruction')
         .each(function(){
           pt.meds_arr.push([
             this.title.value.toString(),
             this.instruction.value.toString()
           ])
         })
        dfd.resolve();
      })
      .error(error_cb);
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

        // testing json-ld
        jsdata = { '@graph': [] };
        demos.graph
             .where('?s ?p ?o')
             .each(function(i, bindings, triples){

               var jstriple_dump = function(jst){
                 // console.log('@id: ', jst['@id'])
                 // console.log(jst);
               }

               // note: this.s == bindings.s == triples[0].subject
               if (i>0) {
                 // .dump() returns RDF/JSON representation
                 // console.log(this.s.dump().value
                 //           , '('
                 //           , this.s.dump().type
                 //           , ')'
                 //           , this.p.dump().value
                 //           , '('
                 //           , this.p.dump().type
                 //           , ')'
                 //           , this.o.dump().value
                 //           , '('
                 //           , this.o.dump().type
                 //           , ')'
                 //           , '\n');

                 jstriple = {
                   '@id': this.s.dump().value,
                 };

                 // if o is a literal
                 if (this.o.dump().type === 'literal') {
                   jstriple[this.p.dump().value] = [this.o.dump().value]
                 }
                 else if (this.p.dump().value === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type') {
                   jstriple['@type'] = this.o.dump().value
                 }
                 else if (this.o.dump().type === 'uri' || 'bnode') {
                   jstriple[this.p.dump().value] = [{
                     '@id': this.o.dump().value
                   }]
                 }

                 jsdata['@graph'].push(jstriple);
               }
             })

          console.log(JSON.stringify(jsdata))

        dfd.resolve();
      })
      .error(error_cb);
  }).promise();
};

var VITAL_SIGNS_get = function(){
  return $.Deferred(function(dfd){
    SMART.VITAL_SIGNS_get()
      .success(function(r){
        var _get_bps = function(type) {
          var code = '';
          var bp_arr = [];
          var bp, bp_next = {};

          if (type === 'systolic') code = '<http://purl.bioontology.org/ontology/LNC/8480-6>';
          else if (type === 'diastolic') code = '<http://purl.bioontology.org/ontology/LNC/8462-4>';
          else alert('error: bp type not systolic or diastolic!');

          r.graph
           .prefix('rdf',      'http://www.w3.org/1999/02/22-rdf-syntax-ns#')
           .prefix('sp',       'http://smartplatforms.org/terms#')
           .prefix('dc',       'http://purl.org/dc/terms/')
           .where('?bn         rdf:type         sp:VitalSign')
           .where('?bn         sp:vitalName     ?vital_name')
           .where('?bn         sp:value         ?value')
           .where('?bn         sp:unit          ?unit')
           .where('?vital_name sp:code          ' + code)
           .where('?bn2        sp:'+ type +'    ?bn')
           .where('?bn2        rdf:type         sp:BloodPressure')
           .where('?vital_id   sp:bloodPressure ?bn2')
           .where('?vital_id   dc:date          ?date')
           .each(function(){
             if (type === 'systolic') {
               bp_arr = pt.sbp_arr;
               bp = pt.sbp;
               bp_next = pt.sbp_next;
             }
             else {
               bp_arr = pt.dbp_arr;
               bp = pt.dbp;
               bp_next = pt.dbp_next;
             }

             bp_arr.push([
               new XDate(this.date.value).valueOf(),
               Number(this.value.value),
               this.unit.value
             ])
           })

           bp_arr = _(bp_arr).sortBy(function(item){ return item[0]; })
           bp = _(bp_arr).last() || null
           bp_next = _(bp_arr).last(2)[0] || null
        }

        _get_bps('systolic');
        _get_bps('diastolic')

        r.graph
         .prefix('rdf',      'http://www.w3.org/1999/02/22-rdf-syntax-ns#')
         .prefix('sp',       'http://smartplatforms.org/terms#')
         .prefix('dc',       'http://purl.org/dc/terms/')
         .where('?vital_id   sp:weight        ?bn')
         .where('?vital_id   dc:date          ?date')
         .where('?bn         sp:vitalName     ?bn2')
         .where('?bn2        sp:code          <http://purl.bioontology.org/ontology/LNC/3141-9>')
         .where('?bn         rdf:type         sp:VitalSign')
         .where('?bn         sp:value         ?value')
         .where('?bn         sp:unit          ?unit')
         .each(function(){
           pt.weight_arr.push([
             new XDate(this.date.value).valueOf(),
             this.unit.value === 'kg' ? Number(this.value.value) * 2.2 : Number(this.value.value),
             this.unit.value === 'kg' ? 'lbs' : this.unit.value
           ])
         })

        pt.weight_arr = _(pt.weight_arr).sortBy(function(item){ return item[0]; })
        pt.weight = _(pt.weight_arr).last() || null

        r.graph
         .prefix('rdf',      'http://www.w3.org/1999/02/22-rdf-syntax-ns#')
         .prefix('sp',       'http://smartplatforms.org/terms#')
         .prefix('dc',       'http://purl.org/dc/terms/')
         .where('?vital_id   sp:height        ?bn')
         .where('?vital_id   dc:date          ?date')
         .where('?bn         sp:vitalName     ?bn2')
         .where('?bn2        sp:code          <http://purl.bioontology.org/ontology/LNC/8302-2>')
         .where('?bn         rdf:type         sp:VitalSign')
         .where('?bn         sp:value         ?value')
         .where('?bn         sp:unit          ?unit')
         .each(function(){
           pt.height_arr.push([
             new XDate(this.date.value).valueOf(),
             this.unit.value === 'm' ? Number(this.value.value) *  3.2808399 * 12 : Number(this.value.value),
             this.unit.value === 'm' ? 'in' : this.unit.value
           ])
         })

        pt.height_arr = _(pt.height_arr).sortBy(function(item){ return item[0]; })
        pt.height = _(pt.height_arr).last() || null

        dfd.resolve();
      })
      .error(error_cb);
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
        r.graph
         .prefix('rdf', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#')
         .prefix('sp',  'http://smartplatforms.org/terms#')
         .where('?lr    rdf:type              sp:LabResult')
         .where('?lr    sp:labName            ?bn1')
         .where('?bn1   sp:code               <http://purl.bioontology.org/ontology/LNC/13457-7>')
         .where('?lr    sp:quantitativeResult ?bn2')
         .where('?bn2   rdf:type              sp:QuantitativeResult')
         .where('?bn2   sp:valueAndUnit       ?bn3')
         .where('?bn3   rdf:type              sp:ValueAndUnit')
         .where('?bn3   sp:value              ?value')
         .where('?bn3   sp:unit               ?unit')
         .where('?lr    dcterms:date  ?date')
         .each(function(){
           // FIXME: hack push all dates + 3 years
           var d = new XDate(this.date.value)
           d.addYears(3, true);

           // array is [js timestamp, value as number, unit as string]
           // flot uses js timestamps on the x axis, we convert them to human-readable strings later
           pt.ldl_arr.push([
              d.valueOf(),
              Number(this.value.value),
              this.unit.value
           ])
         })

         pt.ldl_arr = _(pt.ldl_arr).sortBy(function(item){ return item[0]; })
         pt.ldl = _(pt.ldl_arr).last() || null
         pt.ldl_next = _(pt.ldl_arr).last(2)[0] || null

         // A1C Codes
         //
         // LOINC Code, Long name, Short Name, class, rank # of 2000
         // 4548-4,Hemoglobin A1c/Hemoglobin.total in Blood,Hgb A1c MFr Bld,HEM/BC,81
         // 17856-6,Hemoglobin A1c/Hemoglobin.total in Blood by HPLC,Hgb A1c MFr Bld HPLC,HEM/BC,215
         // FIXME: ONLY top A1c code!!
         r.graph
          .prefix('rdf', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#')
          .prefix('sp',  'http://smartplatforms.org/terms#')
          .where('?lr    rdf:type              sp:LabResult')
          .where('?lr    sp:labName            ?bn1')
          .where('?bn1   sp:code               <http://purl.bioontology.org/ontology/LNC/4548-4>')
          .where('?lr    sp:quantitativeResult ?bn2')
          .where('?bn2   rdf:type              sp:QuantitativeResult')
          .where('?bn2   sp:valueAndUnit       ?bn3')
          .where('?bn3   rdf:type              sp:ValueAndUnit')
          .where('?bn3   sp:value              ?value')
          .where('?bn3   sp:unit               ?unit')
          .where('?lr    dcterms:date  ?date')
          .each(function(){

            // fixme: hack pushing date 2 yrs
            var d = new XDate(this.date.value)
            d.addYears(2, true);

            pt.a1c_arr.push([
              d.valueOf(),
              Number(this.value.value),
              this.unit.value
            ])
          })

          pt.a1c_arr = _(pt.a1c_arr).sortBy(function(item){ return item[0]; })
          pt.a1c = _(pt.a1c_arr).last() || null
          pt.a1c_next = _(pt.a1c_arr).last(2)[0] || null

          // Ur Tp
          //
          // 5804-0,Protein [Mass/volume] in Urine by Test strip,Prot Ur Strip-mCnc,UA,74
          // 2888-6,Protein [Mass/volume] in Urine,Prot Ur-mCnc,UA,292
          // 35663-4,Protein [Mass/volume] in unspecified time Urine,Prot ?Tm Ur-mCnc,UA,635
          // 21482-5,Protein [Mass/volume] in 24 hour Urine,Prot 24H Ur-mCnc,CHEM,1696
          // FIXME: ONLY top code!!
          r.graph
           .prefix('rdf', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#')
           .prefix('sp',  'http://smartplatforms.org/terms#')
           .where('?lr    rdf:type              sp:LabResult')
           .where('?lr    sp:labName            ?bn1')
           .where('?bn1   sp:code               <http://purl.bioontology.org/ontology/LNC/5804-0>')
           .where('?lr    sp:quantitativeResult ?bn2')
           .where('?bn2   rdf:type              sp:QuantitativeResult')
           .where('?bn2   sp:valueAndUnit       ?bn3')
           .where('?bn3   rdf:type              sp:ValueAndUnit')
           .where('?bn3   sp:value              ?value')
           .where('?bn3   sp:unit               ?unit')
           .where('?lr    dcterms:date  ?date')
           .each(function(){
             pt.ur_tp_arr.push([
                new XDate(this.date.value).valueOf(),
                Number(this.value.value),
                this.unit.value
             ])
           })

           pt.ur_tp_arr = _(pt.ur_tp_arr).sortBy(function(item){ return item[0]; })
           pt.ur_tp = _(pt.ur_tp_arr).last() || null
           pt.ur_tp_next = _(pt.ur_tp_arr).last(2)[0] || null

         // Microalbumin/Creatinine [Mass ratio] in Urine
         //
         // 14959-1,Microalbumin/Creatinine [Mass ratio] in Urine,Microalbumin/Creat Ur-mRto,CHEM,212
         // 14958-3,Microalbumin/Creatinine [Mass ratio] in 24 hour Urine,Microalbumin/Creat 24H Ur-mRto,CHEM,1979
         // FIXME: ONLY top code!!
         r.graph
          .prefix('rdf', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#')
          .prefix('sp',  'http://smartplatforms.org/terms#')
          .where('?lr    rdf:type              sp:LabResult')
          .where('?lr    sp:labName            ?bn1')
          .where('?bn1   sp:code               <http://purl.bioontology.org/ontology/LNC/14959-1>')
          .where('?lr    sp:quantitativeResult ?bn2')
          .where('?bn2   rdf:type              sp:QuantitativeResult')
          .where('?bn2   sp:valueAndUnit       ?bn3')
          .where('?bn3   rdf:type              sp:ValueAndUnit')
          .where('?bn3   sp:value              ?value')
          .where('?bn3   sp:unit               ?unit')
          .where('?lr    dcterms:date  ?date')
          .each(function(){
            // FIXME: hack push all dates + 3 years
            var d = new XDate(this.date.value)
            d.addYears(3, true);

            pt.m_alb_cre_ratio_arr.push([
              d.valueOf(),
              Number(this.value.value),
              this.unit.value
            ])
          })

          pt.m_alb_cre_ratio_arr = _(pt.m_alb_cre_ratio_arr).sortBy(function(item){ return item[0]; })
          pt.m_alb_cre_ratio = _(pt.m_alb_cre_ratio_arr).last() || null
          pt.m_alb_cre_ratio_next = _(pt.m_alb_cre_ratio_arr).last(2)[0] || null

         // Aspartate aminotransferase / SGOT / AST
         //
         // only 1 code!! #20!!
         //
         // LOINC Code, Long name, Short Name, class, rank # of 2000
         // 1920-8,Aspartate aminotransferase [Enzymatic activity/volume] in Serum or Plasma,AST SerPl-cCnc,CHEM,19
         r.graph
          .prefix('rdf', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#')
          .prefix('sp',  'http://smartplatforms.org/terms#')
          .where('?lr    rdf:type              sp:LabResult')
          .where('?lr    sp:labName            ?bn1')
          .where('?bn1   sp:code               <http://purl.bioontology.org/ontology/LNC/1920-8>')
          .where('?lr    sp:quantitativeResult ?bn2')
          .where('?bn2   rdf:type              sp:QuantitativeResult')
          .where('?bn2   sp:valueAndUnit       ?bn3')
          .where('?bn3   rdf:type              sp:ValueAndUnit')
          .where('?bn3   sp:value              ?value')
          .where('?bn3   sp:unit               ?unit')
          .where('?lr    dcterms:date  ?date')
          .each(function(){
            // FIXME: hack push all dates + 3 years
            var d = new XDate(this.date.value)
            d.addYears(3, true);

            pt.sgot_arr.push([
              d.valueOf(),
              Number(this.value.value),
              this.unit.value
            ])
          })

          pt.sgot_arr = _(pt.sgot_arr).sortBy(function(item){ return item[0]; })
          pt.sgot = _(pt.sgot_arr).last() || null
          pt.sgot_next = _(pt.sgot_arr).last(2)[0] || null

         // Cholesterol (total): only 1 code!! Yay!
         //
         // 2093-3,Cholesterol [Mass/volume] in Serum or Plasma,Cholest SerPl-mCnc,CHEM,32
         r.graph
          .prefix('rdf', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#')
          .prefix('sp',  'http://smartplatforms.org/terms#')
          .where('?lr    rdf:type              sp:LabResult')
          .where('?lr    sp:labName            ?bn1')
          .where('?bn1   sp:code               <http://purl.bioontology.org/ontology/LNC/2093-3>')
          .where('?lr    sp:quantitativeResult ?bn2')
          .where('?bn2   rdf:type              sp:QuantitativeResult')
          .where('?bn2   sp:valueAndUnit       ?bn3')
          .where('?bn3   rdf:type              sp:ValueAndUnit')
          .where('?bn3   sp:value              ?value')
          .where('?bn3   sp:unit               ?unit')
          .where('?lr    dcterms:date  ?date')
          .each(function(){
            // FIXME: hack push all dates + 3 years
            var d = new XDate(this.date.value)
            d.addYears(3, true);

            pt.chol_total_arr.push([
              d.valueOf(),
              Number(this.value.value),
              this.unit.value
            ])
          })

          pt.chol_total_arr = _(pt.chol_total_arr).sortBy(function(item){ return item[0]; })
          pt.chol_total = _(pt.chol_total_arr).last() || null
          pt.chol_total_next = _(pt.chol_total_arr).last(2)[0] || null

         // Tri
         //
         // 2571-8,Triglyceride [Mass/volume] in Serum or Plasma,Trigl SerPl-mCnc,CHEM,36
         // 3043-7,Triglyceride [Mass/volume] in Blood,Trigl Bld-mCnc,CHEM,1592
         // fixme only 1 code!
         r.graph
          .prefix('rdf', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#')
          .prefix('sp',  'http://smartplatforms.org/terms#')
          .where('?lr    rdf:type              sp:LabResult')
          .where('?lr    sp:labName            ?bn1')
          .where('?bn1   sp:code               <http://purl.bioontology.org/ontology/LNC/2571-8>')
          .where('?lr    sp:quantitativeResult ?bn2')
          .where('?bn2   rdf:type              sp:QuantitativeResult')
          .where('?bn2   sp:valueAndUnit       ?bn3')
          .where('?bn3   rdf:type              sp:ValueAndUnit')
          .where('?bn3   sp:value              ?value')
          .where('?bn3   sp:unit               ?unit')
          .where('?lr    dcterms:date  ?date')
          .each(function(){
            // FIXME: hack push all dates + 3 years
            var d = new XDate(this.date.value)
            d.addYears(3, true);

            pt.triglyceride_arr.push([
              d.valueOf(),
              Number(this.value.value),
              this.unit.value
            ])
          })

          pt.triglyceride_arr = _(pt.triglyceride_arr).sortBy(function(item){ return item[0]; })
          pt.triglyceride = _(pt.triglyceride_arr).last() || null
          pt.triglyceride_next = _(pt.triglyceride_arr).last(2)[0] || null

         // HDL
         // 2085-9,Cholesterol in HDL [Mass/volume] in Serum or Plasma,HDLc SerPl-mCnc,CHEM,38
         r.graph
          .prefix('rdf', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#')
          .prefix('sp',  'http://smartplatforms.org/terms#')
          .where('?lr    rdf:type              sp:LabResult')
          .where('?lr    sp:labName            ?bn1')
          .where('?bn1   sp:code               <http://purl.bioontology.org/ontology/LNC/2085-9>')
          .where('?lr    sp:quantitativeResult ?bn2')
          .where('?bn2   rdf:type              sp:QuantitativeResult')
          .where('?bn2   sp:valueAndUnit       ?bn3')
          .where('?bn3   rdf:type              sp:ValueAndUnit')
          .where('?bn3   sp:value              ?value')
          .where('?bn3   sp:unit               ?unit')
          .where('?lr    dcterms:date  ?date')
          .each(function(){
            // FIXME: hack push all dates + 3 years
            var d = new XDate(this.date.value)
            d.addYears(3, true);

            pt.hdl_arr.push([
              d.valueOf(),
              Number(this.value.value),
              this.unit.value
            ])
          })

          pt.hdl_arr = _(pt.hdl_arr).sortBy(function(item){ return item[0]; })
          pt.hdl = _(pt.hdl_arr).last() || null
          pt.hdl_next = _(pt.hdl_arr).last(2)[0] || null

         // BUN
         //
         // 3094-0,Urea nitrogen [Mass/volume] in Serum or Plasma,BUN SerPl-mCnc,CHEM,6
         // 6299-2,Urea nitrogen [Mass/volume] in Blood,BUN Bld-mCnc,CHEM,288
         // fixme only top code
         r.graph
          .prefix('rdf', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#')
          .prefix('sp',  'http://smartplatforms.org/terms#')
          .where('?lr    rdf:type              sp:LabResult')
          .where('?lr    sp:labName            ?bn1')
          .where('?bn1   sp:code               <http://purl.bioontology.org/ontology/LNC/4548-4>')
          .where('?lr    sp:quantitativeResult ?bn2')
          .where('?bn2   rdf:type              sp:QuantitativeResult')
          .where('?bn2   sp:valueAndUnit       ?bn3')
          .where('?bn3   rdf:type              sp:ValueAndUnit')
          .where('?bn3   sp:value              ?value')
          .where('?bn3   sp:unit               ?unit')
          .where('?lr    dcterms:date  ?date')
          .each(function(){
            // FIXME: hack push all dates + 3 years
            var d = new XDate(this.date.value)
            d.addYears(3, true);

            pt.bun_arr.push([
              d.valueOf(),
              Number(this.value.value),
              this.unit.value
            ])
          })

          pt.bun_arr = _(pt.bun_arr).sortBy(function(item){ return item[0]; })
          pt.bun = _(pt.bun_arr).last() || null
          pt.bun_next = _(pt.bun_arr).last(2)[0] || null

         // Cre
         //
         // 2160-0,Creatinine [Mass/volume] in Serum or Plasma,Creat SerPl-mCnc,CHEM,1
         // 38483-4,Creatinine [Mass/volume] in Blood,Creat Bld-mCnc,CHEM,283
         // fixme only top code
         r.graph
          .prefix('rdf', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#')
          .prefix('sp',  'http://smartplatforms.org/terms#')
          .where('?lr    rdf:type              sp:LabResult')
          .where('?lr    sp:labName            ?bn1')
          .where('?bn1   sp:code               <http://purl.bioontology.org/ontology/LNC/2160-0>')
          .where('?lr    sp:quantitativeResult ?bn2')
          .where('?bn2   rdf:type              sp:QuantitativeResult')
          .where('?bn2   sp:valueAndUnit       ?bn3')
          .where('?bn3   rdf:type              sp:ValueAndUnit')
          .where('?bn3   sp:value              ?value')
          .where('?bn3   sp:unit               ?unit')
          .where('?lr    dcterms:date  ?date')
          .each(function(){
            // FIXME: hack push all dates + 3 years
            var d = new XDate(this.date.value)
            d.addYears(3, true);

            pt.creatinine_arr.push([
              d.valueOf(),
              Number(this.value.value),
              this.unit.value
            ])
          })

          pt.creatinine_arr = _(pt.creatinine_arr).sortBy(function(item){ return item[0]; })
          pt.creatinine = _(pt.creatinine_arr).last() || null
          pt.creatinine_next = _(pt.creatinine_arr).last(2)[0] || null

         // Glu
         // 2345-7,Glucose [Mass/volume] in Serum or Plasma,Glucose SerPl-mCnc,CHEM,4
         // 2339-0,Glucose [Mass/volume] in Blood,Glucose Bld-mCnc,CHEM,13
         // fixme only top code
         r.graph
          .prefix('rdf', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#')
          .prefix('sp',  'http://smartplatforms.org/terms#')
          .where('?lr    rdf:type              sp:LabResult')
          .where('?lr    sp:labName            ?bn1')
          .where('?bn1   sp:code               <http://purl.bioontology.org/ontology/LNC/2345-7>')
          .where('?lr    sp:quantitativeResult ?bn2')
          .where('?bn2   rdf:type              sp:QuantitativeResult')
          .where('?bn2   sp:valueAndUnit       ?bn3')
          .where('?bn3   rdf:type              sp:ValueAndUnit')
          .where('?bn3   sp:value              ?value')
          .where('?bn3   sp:unit               ?unit')
          .where('?lr    dcterms:date  ?date')
          .each(function(){
            // FIXME: hack push all dates + 3 years
            var d = new XDate(this.date.value)
            d.addYears(3, true);

            pt.glucose_arr.push([
              d.valueOf(),
              Number(this.value.value),
              this.unit.value
            ])
          })

          pt.glucose_arr = _(pt.glucose_arr).sortBy(function(item){ return item[0]; })
          pt.glucose = _(pt.glucose_arr).last() || null
          pt.glucose_next = _(pt.glucose_arr).last(2)[0] || null

         // BUN
         //
         // 3094-0,Urea nitrogen [Mass/volume] in Serum or Plasma,BUN SerPl-mCnc,CHEM,6
         // 6299-2,Urea nitrogen [Mass/volume] in Blood,BUN Bld-mCnc,CHEM,288
         // fixme only top code
         r.graph
          .prefix('rdf', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#')
          .prefix('sp',  'http://smartplatforms.org/terms#')
          .where('?lr    rdf:type              sp:LabResult')
          .where('?lr    sp:labName            ?bn1')
          .where('?bn1   sp:code               <http://purl.bioontology.org/ontology/LNC/4548-4>')
          .where('?lr    sp:quantitativeResult ?bn2')
          .where('?bn2   rdf:type              sp:QuantitativeResult')
          .where('?bn2   sp:valueAndUnit       ?bn3')
          .where('?bn3   rdf:type              sp:ValueAndUnit')
          .where('?bn3   sp:value              ?value')
          .where('?bn3   sp:unit               ?unit')
          .where('?lr    dcterms:date  ?date')
          .each(function(){

            // FIXME: hack push all dates + 3 years
            var d = new XDate(this.date.value)
            d.addYears(3, true);

            pt.bun_arr.push([
              d.valueOf(),
              Number(this.value.value),
              this.unit.value
            ])
          })

          pt.bun_arr = _(pt.bun_arr).sortBy(function(item){ return item[0]; })
          pt.bun = _(pt.bun_arr).last() || null
          pt.bun_next = _(pt.bun_arr).last(2)[0] || null

          //
          // Reminders
          //
          var reminder_data = [
          {
            'title_html':             'glycemia',
            'reminder_html':          'Consider checking A1C today',
            'lab_variable':           pt.a1c,
            'lab_name_html':          'A1C',
            'target_min':             0,
            'target_max':             7,
            'target_unit':            '%',
            'target_range_text_html': 'less than 7%',
            'overdue_in_months':      6,
            'extra_info_html':        null
          },
          {
            'title_html':             'lipids',
            'reminder_html':          'Consider checking lipids today',
            'lab_variable':           pt.ldl,
            'lab_name_html':          'LDL',
            'target_min':             0,
            'target_max':             100,
            'target_unit':            'mg/dl',
            'target_range_text_html': 'less than 100mg/dl',
            'overdue_in_months':      6,
            'extra_info_html':        'Consider more aggressive target of &lt; 70 (established CAD).'
          },
          {
            'title_html':             'albuminuria',
            'reminder_html':          'Consider checking urine &micro;alb/cre ratio today',
            'lab_variable':           pt.m_alb_cre_ratio,
            'lab_name_html':          'urine &alb/cre ratio',
            'target_min':             0,
            'target_max':             30,
            'target_unit':            'mg/g',
            'target_range_text_html': 'less than 30', // FIXME: we don't really know this
            'overdue_in_months':      6, // FIXME: we don't really know this
            'extra_info_html':        '&micro;alb/cre ratio test preferred over non-ratio &micro;alp screening tests.'
          }]

          var process_reminders = function(reminder_data){
            _(reminder_data).each(function(r){
              if (r.lab_variable) {
                // is the latest date within the given range?
                var today = new XDate();
                var d = new XDate(r.lab_variable[0])
                r.overdue_p = false;
                r.months_ago = Math.round(d.diffMonths(today));
                if (r.months_ago > r.overdue_in_months) { r.overdue_p = true; }

                // is the latest value within the given range?
                r.in_range_p = false;
                if (r.target_min < r.lab_variable[1] &&
                    r.lab_variable[1] < r.target_max) {
                  r.in_range_p = true;
                }

                pt.reminders_arr.push(r);
              } else {
                return;
              }
            })
          }

          process_reminders(reminder_data);

         // resolved!
         dfd.resolve();
      })
      .error(error_cb);
  }).promise();
};


var PROBLEMS_get = function(){
  return $.Deferred(function(dfd){
    SMART.PROBLEMS_get()
      .success(function(r){
        r.graph
         .prefix('rdf', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#')
         .prefix('sp',  'http://smartplatforms.org/terms#')
         .prefix('dc',  'http://purl.org/dc/terms/')
         .where('?id    rdf:type       sp:Problem')
         .where('?id    sp:startDate   ?date')
         .where('?id    sp:problemName ?bn')
         .where('?bn    rdf:type       sp:CodedValue')
         .where('?bn    dc:title       ?title')
         .each(function(){
           pt.problems_arr.push([
             new XDate(this.date.value).valueOf(),
             this.title.value
           ])
         })

        pt.problems_arr = _(pt.problems_arr).sortBy(function(item){ return item[0]; })
        dfd.resolve();
      })
      .error(error_cb);
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
       , PROBLEMS_get()
       , MEDS_get()
  )
  .then(function(){

    $('#family_name').text(pt.family_name)
    $('#given_name').text(pt.given_name)
    $('#record_id').text(SMART.record.id)
    $('#birthday').text(pt.bday)
    var b = new XDate(pt.bday)
    $('#age').text(Math.round(b.diffYears(new XDate())));
    $('#gender').text(pt.gender[0])


    // insert data into html
    // last known values (all arrays sorted by ascending dates)
    // FIXME: DRY
    $('#ur_tp_date').text(pt.ur_tp ? new XDate(pt.ur_tp[0]).toString('MM/dd/yy') : null)
    $('#ur_tp_val') .text(pt.ur_tp ? pt.ur_tp[1] : null)
    $('#ur_tp_unit').text(pt.ur_tp ? pt.ur_tp[2] : null)

    $('#ur_tp_next_date').text(pt.ur_tp_next ? new XDate(pt.ur_tp_next[0]).toString('MM/dd/yy') : null)
    $('#ur_tp_next_val') .text(pt.ur_tp_next ? pt.ur_tp_next[1] : null)
    $('#ur_tp_next_unit').text(pt.ur_tp_next ? pt.ur_tp_next[2] : null)

    $('#m_alb_cre_ratio').text(pt.m_alb_cre_ratio ? new XDate(pt.m_alb_cre_ratio[0]).toString('MM/dd/yy') : null)
    $('#m_alb_cre_ratio_val') .text(pt.m_alb_cre_ratio ? pt.m_alb_cre_ratio[1] : null)
    $('#m_alb_cre_ratio_unit').text(pt.m_alb_cre_ratio ? pt.m_alb_cre_ratio[2] : null)

    $('#m_alb_cre_ratio_next_date').text(pt.m_alb_cre_ratio_next ? new XDate(pt.m_alb_cre_ratio_next[0]).toString('MM/dd/yy') : null)
    $('#m_alb_cre_ratio_next_val') .text(pt.m_alb_cre_ratio_next ? pt.m_alb_cre_ratio_next[1] : null)
    $('#m_alb_cre_ratio_next_unit').text(pt.m_alb_cre_ratio_next ? pt.m_alb_cre_ratio_next[2] : null)

    $('#sgot_date').text(pt.sgot ? new XDate(pt.sgot[0]).toString('MM/dd/yy') : null)
    $('#sgot_val') .text(pt.sgot ? pt.sgot[1] : null)
    $('#sgot_unit').text(pt.sgot ? pt.sgot[2] : null)

    $('#sgot_next_date').text(pt.sgot_next ? new XDate(pt.sgot_next[0]).toString('MM/dd/yy') : null)
    $('#sgot_next_val') .text(pt.sgot_next ? pt.sgot_next[1] : null)
    $('#sgot_next_unit').text(pt.sgot_next ? pt.sgot_next[2] : null)

    $('#chol_total_date').text(pt.chol_total ? new XDate(pt.chol_total[0]).toString('MM/dd/yy') : null)
    $('#chol_total_val') .text(pt.chol_total ? pt.chol_total[1] : null)
    $('#chol_total_unit').text(pt.chol_total ? pt.chol_total[2] : null)

    $('#chol_total_next_date').text(pt.chol_total_next ? new XDate(pt.chol_total_next[0]).toString('MM/dd/yy') : null)
    $('#chol_total_next_val') .text(pt.chol_total_next ? pt.chol_total_next[1] : null)
    $('#chol_total_next_unit').text(pt.chol_total_next ? pt.chol_total_next[2] : null)

    $('#triglyceride_date').text(pt.triglyceride ? new XDate(pt.triglyceride[0]).toString('MM/dd/yy') : null)
    $('#triglyceride_val') .text(pt.triglyceride ? pt.triglyceride[1] : null)
    $('#triglyceride_unit').text(pt.triglyceride ? pt.triglyceride[2] : null)

    $('#triglyceride_next_date').text(pt.triglyceride_next ? new XDate(pt.triglyceride_next[0]).toString('MM/dd/yy') : null)
    $('#triglyceride_next_val') .text(pt.triglyceride_next ? pt.triglyceride_next[1] : null)
    $('#triglyceride_next_unit').text(pt.triglyceride_next ? pt.triglyceride_next[2] : null)

    $('#hdl_date').text(pt.hdl ? new XDate(pt.hdl[0]).toString('MM/dd/yy') : null)
    $('#hdl_val') .text(pt.hdl ? pt.hdl[1] : null)
    $('#hdl_unit').text(pt.hdl ? pt.hdl[2] : null)

    $('#hdl_next_date').text(pt.hdl_next ? new XDate(pt.hdl_next[0]).toString('MM/dd/yy') : null)
    $('#hdl_next_val') .text(pt.hdl_next ? pt.hdl_next[1] : null)
    $('#hdl_next_unit').text(pt.hdl_next ? pt.hdl_next[2] : null)

    $('#ldl_date').text(pt.ldl ? new XDate(pt.ldl[0]).toString('MM/dd/yy') : null)
    $('#ldl_val') .text(pt.ldl ? pt.ldl[1] : null)
    $('#ldl_unit').text(pt.ldl ? pt.ldl[2] : null)

    $('#ldl_next_date').text(pt.ldl_next ? new XDate(pt.ldl_next[0]).toString('MM/dd/yy') : null)
    $('#ldl_next_val') .text(pt.ldl_next ? pt.ldl_next[1] : null)
    $('#ldl_next_unit').text(pt.ldl_next ? pt.ldl_next[2] : null)

    $('#bun_date').text(pt.bun ? new XDate(pt.bun[0]).toString('MM/dd/yy') : null)
    $('#bun_val') .text(pt.bun ? pt.bun[1] : null)
    $('#bun_unit').text(pt.bun ? pt.bun[2] : null)

    $('#bun_next_date').text(pt.bun_next ? new XDate(pt.bun_next[0]).toString('MM/dd/yy') : null)
    $('#bun_next_val') .text(pt.bun_next ? pt.bun_next[1] : null)
    $('#bun_next_unit').text(pt.bun_next ? pt.bun_next[2] : null)

    $('#creatinine_date').text(pt.creatinine ? new XDate(pt.creatinine[0]).toString('MM/dd/yy') : null)
    $('#creatinine_val') .text(pt.creatinine ? pt.creatinine[1] : null)
    $('#creatinine_unit').text(pt.creatinine ? pt.creatinine[2] : null)

    $('#creatinine_next_date').text(pt.creatinine_next ? new XDate(pt.creatinine_next[0]).toString('MM/dd/yy') : null)
    $('#creatinine_next_val') .text(pt.creatinine_next ? pt.creatinine_next[1] : null)
    $('#creatinine_next_unit').text(pt.creatinine_next ? pt.creatinine_next[2] : null)

    $('#glucose_date').text(pt.glucose ? new XDate(pt.glucose[0]).toString('MM/dd/yy') : null)
    $('#glucose_val') .text(pt.glucose ? pt.glucose[1] : null)
    $('#glucose_unit').text(pt.glucose ? pt.glucose[2] : null)

    $('#glucose_next_date').text(pt.glucose_next ? new XDate(pt.glucose_next[0]).toString('MM/dd/yy') : null)
    $('#glucose_next_val') .text(pt.glucose_next ? pt.glucose_next[1] : null)
    $('#glucose_next_unit').text(pt.glucose_next ? pt.glucose_next[2] : null)

    $('#a1c_date').text(pt.a1c ? new XDate(pt.a1c[0]).toString('MM/dd/yy') : null)
    $('#a1c_val') .text(pt.a1c ? pt.a1c[1] : null)
    $('#a1c_unit').text(pt.a1c ? pt.a1c[2] : null)

    $('#a1c_next_date').text(pt.a1c_next ? new XDate(pt.a1c_next[0]).toString('MM/dd/yy') : null)
    $('#a1c_next_val') .text(pt.a1c_next ? pt.a1c_next[1] : null)
    $('#a1c_next_unit').text(pt.a1c_next ? pt.a1c_next[2] : null)

    // other info
    $('#weight_date').text(pt.weight ? new XDate(pt.weight[0]).toString('MM/dd/yy') : null)
    $('#weight_val') .text(pt.weight ? _round(pt.weight[1], 0) : null)
    $('#weight_unit').text(pt.weight ? pt.weight[2] : null)

    $('#height_date').text(pt.height ? new XDate(pt.height[0]).toString('MM/dd/yy') : null)
    $('#height_val') .text(pt.height ? _round(pt.height[1], 0) : null)
    $('#height_unit').text(pt.height ? pt.height[2] : null)

    // $('#pneumovax_date').text(pt.a1c ? new XDate(pt.a1c[0]).toString('MM/dd/yy') : null)
    // $('#flu_shot_date').text(pt.a1c ? new XDate(pt.a1c[0]).toString('MM/dd/yy') : null)

    if (pt.problems_arr.length == 0) { $('<div></div>', {text: 'No known problems'}).appendTo('#problems'); }
    _(pt.problems_arr).each(function(e){
      $('<div></div>', {
        class: 'problem',
        text: e[1]
      }).appendTo('#problems')
    })

    $('.problem').filter(':odd').each(function(i,e){ $(e).css({'background-color': '#ebebeb'}); })

    // (some) cv comorbidities
    // fixme: I'm sure there are many more...
    // http://www.ncbi.nlm.nih.gov/pmc/articles/PMC550650/
    var cv_comorbidities = _(pt.problems_arr).filter(function(e) {
      var title = e[1];
      if (title.match(/heart disease/i)) return true;
      if (title.match(/Congestive Heart Failure/i)) return true;
      if (title.match(/Myocardial Infarction/i)) return true;
      if (title.match(/Cerebrovascular Disease	/i)) return true;
      if (title.match(/Hypertension/i)) return true;
      if (title.match(/neuropathic pain/i)) return true;
      if (title.match(/coronary arteriosclerosis/i)) return true;
      if (title.match(/chronic renal impariment/i)) return true;
      if (title.match(/cardiac bypass graft surgery/i)) return true;
      if (title.match(/Preinfarction syndrome/i)) return true;
      if (title.match(/Chest pain/i)) return true;
      if (title.match(/Chronic ischemic heart disease/i)) return true;
      if (title.match(/Disorder of cardiovascular system/i)) return true;
      if (title.match(/Precordial pain/i)) return true;
      return false;
    })

    if (cv_comorbidities.length == 0) { $('<div></div>', {text: 'No known CV comorbidities'}).appendTo('#cv_comorbidities'); }
    _(cv_comorbidities).each(function(e){
      $('<div></div>', {
        class: 'cv_comorbidity',
        text: e[1]
      }).appendTo('#cv_comorbidities')
    })

    $('.cv_comorbidity').filter(':odd').each(function(i,e){ $(e).css({'background-color': '#ebebeb'}); })

    // allergies
    if (pt.allergies_arr.length == 0) { $('<div/>', {text: 'No known allergies'}).appendTo('#allergies'); }
    _(pt.allergies_arr).each(function(e){
      $('<div></div>', {
        class: 'allergy',
        html: '<span class=\'bold\'>' + e[0] + '</span> ' + e[1] + '.'
      }).appendTo('#allergies')
    })

    $('.allergy').filter(':odd').each(function(i,e){ $(e).css({'background-color': '#ebebeb'}); })

    // medications
    if (pt.meds_arr.length == 0) { $('<div/>', {text: 'No known medications'}).appendTo('#medications'); }
    _(pt.meds_arr).each(function(e){
      $('<div></div>', {
        class: 'medication',
        html: '<span class=\'bold\'>' + e[0] + '</span> ' + e[1] + '.'
      }).appendTo('#medications')
    })

    $('.medication').filter(':odd').each(function(i,e){ $(e).css({'background-color': '#ebebeb'}); })

    //
    // reminders
    //
    if (pt.reminders_arr.length == 0) { $('<div/>', {text: 'No current reminders'}).appendTo('#reminders'); }
    _(pt.reminders_arr).each(function(e){
      // todo: use templating here
      var html = '<span class=\'bold\'>' + e.title_html + '</span> ';
      if (e.overdue_p) {
        html = html + '<span class=\'bold red\'>'  + e.reminder_html + '</span> <br />';
      }

      var d = new XDate(e.lab_variable[0])
      html = html + 'Last ' + e.lab_name_html +
        ' ('+ e.lab_variable[1] + e.lab_variable[2] + ') ' +
        ' done on ' + d.toString('MM/dd/yy') + ' (' + e.months_ago + ' months ago)' ;

      if (e.in_range_p) {
        html = html + ' within target range (' + e.target_range_text_html + ').'
      } else {
        html = html + ' <span class=\'bold\'>out of target range</span> (' + e.target_range_text_html + ').'
      }

      $('<div></div>', {
        class: 'reminder',
        html: html
      }).appendTo('#reminders')
    })

    $('.reminder').filter(':odd').each(function(i,e){ $(e).css({'background-color': '#ebebeb'}); })

    var draw_plots = function(){
      var flot_options_bp, flot_options_ldl, flot_options_a1c = {};
      flot_options_bp = {
        xaxis: {
          mode: 'time',
          timeformat: '%y',
          min: new XDate('2010').valueOf(),
          max: new XDate().valueOf(),
          tickSize: [1, 'year'],
          minTickSize: [1, 'year']
        },
        yaxis: {
          min: 50,
          max: 200,
          ticks: [50, 100, 150, 200],
          tickLength: 0
        },
        series: {
          lines: { show: false },
          points: { show: true }
        },
        grid: {
          backgroundColor: '#ebebeb',
          borderWidth: 1,
          markings: [
            { yaxis: { from: 80, to: 80 }, color: "#ccc" },
            { yaxis: { from: 130, to: 130 }, color: "#ccc" }
          ]
        }
      }

      flot_options_ldl = $.extend(true, {}, flot_options_bp);
      flot_options_a1c = $.extend(true, {}, flot_options_bp);

      flot_options_ldl.yaxis = {
        min: 0,
        max: 200,
        ticks: [0, 50, 100, 150, 200],
        tickLength: 0
      }

      flot_options_ldl.grid = {
        backgroundColor: '#ebebeb',
        borderWidth: 1,
        markings: [ { yaxis: { from: 200, to: 100 }, color: "#ccc" } ]
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
        markings: [ { yaxis: { from: 20, to: 7 }, color: "#ccc" } ]
      }

      // set the heights for the graphs and set the (fluid) width
      // of the a1c graph to be the same as the other graphs
      var h = 100;
      $('#bp_graph') .height(h);
      $('#ldl_graph').height(h);
      $('#a1c_graph').height(h).width('50%')

      // plot'em!
      $.plot($("#bp_graph"), [pt.dbp_arr, pt.sbp_arr], flot_options_bp);
      $.plot($("#ldl_graph"), [pt.ldl_arr], flot_options_ldl);
      $.plot($("#a1c_graph"), [pt.a1c_arr], flot_options_a1c);
    };

    draw_plots();
  });
});
