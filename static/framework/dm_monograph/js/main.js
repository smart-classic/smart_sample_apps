//
// main.js for Diabetes Monograph App
//
// Arjun Sanyal <arjun.sanyal@childrens.harvard.edu>
//
// Note: A good pt with a lot of data: p967332 William Robinson
//
// for tables: http://www.datatables.net/index

// Notes
// for ASA / Aspirin allergies
//
// Salicylic Acids [Chemical/Ingredient]
// http://purl.bioontology.org/ontology/NDFRT/N0000007582
// Aspirin [Chemical/Ingredient]
// http://purl.bioontology.org/ontology/NDFRT/N0000006582
// Salicylates [Chemical/Ingredient]
// http://purl.bioontology.org/ontology/NDFRT/N0000006035
// Acetylsalicylate
// http://purl.bioontology.org/ontology/LNC/LP16020-7
//
// for NSAID allergies
//
// Analgesics, nsaids
// http://purl.bioontology.org/ontology/LNC/LP31430-9
//
// for ACE/ARB
// ACE Inhibitors
// benazepril (Lotensin)
// captopril (Capoten)
// enalapril (Vasotec)
// fosinopril (Monopril)
// lisinopril (Prinivil, Zestril)
// perindopril (Aceon)
// quinapril (Accupril)
// ramipril (Altace)
// trandolapril (Mavik)
//
// Angiotensin II Receptor Blockers (ARBs)
// candesartan (Atacand)
// eprosartan (Tevetan)
// irbesartan (Avapro)
// losartan (Cozaar)
// olmesartan (Benicar)
// telmisartan (Micardis)
// valsartan (Diovan)

// default flot options
var _flot_opts = {
  xaxis: {
    mode: 'time',
    timeformat: '%y',
    min: new XDate(2009, 11).valueOf(),
    max: new XDate().valueOf(),
    tickSize: [1, 'year'],
    minTickSize: [1, 'year']
  },
  series: {
    lines: { show: false },
    points: { show: true }
  },
  grid: {
    backgroundColor: 'white',
    borderWidth: 1
  }
}

//
// Patient Object
//
// Plain lab name implies latest result
pt = {};
pt.a1c = null;
pt.a1c_arr = [];
pt.a1c_next = null;
pt.a1c_flot_opts = {};
pt.allergies_arr = [];
pt.bday = null;
pt.bp_flot_opts = {};
pt.bun = null;
pt.bun_arr = [];
pt.bun_next = null;
pt.bun_flot_opts = {};
pt.chol_total = null;
pt.chol_total_arr = [];
pt.chol_total_next = null;
pt.chol_total_flot_opts = {};
pt.creatinine = null;
pt.creatinine_arr = [];
pt.creatinine_next = null;
pt.creatinine_flot_opts = {};
pt.current_sort = '';
pt.dbp = null;
pt.dbp_arr = [];
pt.dbp_next = null;
pt.family_name = null;
pt.flu_shot_date = null;
pt.gender = null;
pt.given_name = null;
pt.glucose = null;
pt.glucose_arr = [];
pt.glucose_next = null;
pt.glucose_flot_opts = {};
pt.hdl = null;
pt.hdl_arr = [];
pt.hdl_next = null;
pt.hdl_flot_opts = {};
pt.height = null;
pt.height_arr = [];
pt.ldl = null;
pt.ldl_arr = [];
pt.ldl_next = null;
pt.ldl_flot_opts = {};
pt.m_alb_cre_ratio = null;
pt.m_alb_cre_ratio_arr = [];
pt.m_alb_cre_ratio_next = null;
pt.m_alb_cre_ratio_flot_opts = {};
pt.meds_arr = [];
pt.pneumovax_date = null;
pt.problems_arr = [];
pt.reminders_arr = [];
pt.sbp = null;
pt.sbp_arr = [];
pt.sbp_next = null;
pt.sgot = null;
pt.sgot_arr = [];
pt.sgot_next = null;
pt.sgot_flot_opts = {};
pt.triglyceride = null;
pt.triglyceride_arr = [];
pt.triglyceride_next = null;
pt.triglyceride_flot_opts = {};
pt.ur_tp = null;
pt.ur_tp_arr = [];
pt.ur_tp_next = null;
pt.ur_tp_flot_opts = {};
pt.weight = null;
pt.weight_arr = [];

var _round = function(val, dec){ return Math.round(val*Math.pow(10,dec))/Math.pow(10,dec); }

//
// Data Queries
//

// pt's with allergies: J Diaz, K Lewis, K Kelly, R Robinson
var ALLERGIES_get = function(){
  return $.Deferred(function(dfd){
    SMART.ALLERGIES_get().then(function(r){
      _(r.objects.of_type.Allergy).each(function(a){
        var allergen = a.drugClassAllergen || a.foodAllergen;
        pt.allergies_arr.push([allergen.dcterms__title
                            , a.allergicReaction.dcterms__title])
      })
      dfd.resolve();
    })
  }).promise();
};

var MEDICATIONS_get = function(){
  return $.Deferred(function(dfd){
    SMART.MEDICATIONS_get().then(function(r){
      _(r.objects.of_type.Medication).each(function(m){
        pt.meds_arr.push([new XDate(m.startDate)
                        , m.drugName.dcterms__title
                        , m.instructions])
      })
      dfd.resolve();
    })
  }).promise();
};

var DEMOGRAPHICS_get = function(){
  return $.Deferred(function(dfd){
    SMART.DEMOGRAPHICS_get().then(function(r){
      var demos = r.objects.of_type.Demographics[0];
      var name = r.objects.of_type.v__Name[0];
      pt.family_name = name.v__family_name;
      pt.given_name  = name.v__given_name;
      pt.gender = demos.foaf__gender;
      pt.bday = demos.v__bday;
      dfd.resolve();
    })
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

        $.extend(true,
          pt.bp_flot_opts,
          _flot_opts,
          {
            yaxis: {
              min: 50,
              max: 200,
              ticks: [50, 100, 150, 200],
              tickLength: 0
            },
            grid: {
              markings: [
                { yaxis: { from: 0, to: 80 }, color: "#eee" },
                { yaxis: { from: 200, to: 130 }, color: "#eee" }
              ]
            }
          }
        );

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
             Number(this.value.value),
             this.unit.value
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
             Number(this.value.value),
             this.unit.value
           ])
         })

        pt.height_arr = _(pt.height_arr).sortBy(function(item){ return item[0]; })
        pt.height = _(pt.height_arr).last() || null

        dfd.resolve();
      })
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
         .where('?lr    sp:specimenCollected  ?bn4')
         .where('?bn4   sp:startDate          ?date')
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
         $.extend(true,
           pt.ldl_flot_opts,
           _flot_opts,
           {
             yaxis: {
               min: 0,
               max: 200,
               ticks: [0, 50, 100, 150, 200],
               tickLength: 0
             },
             grid: {
               markings: [ { yaxis: { from: 200, to: 100 }, color: "#eee" } ]
             }
           }
         );

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
          .where('?lr    sp:specimenCollected  ?bn4')
          .where('?bn4   sp:startDate          ?date')
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
          $.extend(true,
            pt.a1c_flot_opts,
            _flot_opts,
            {
              yaxis: {
                min: 0,
                max: 20,
                ticks: [0, 5, 10, 15, 20],
                tickLength: 0
              },
              grid: {
                markings: [ { yaxis: { from: 20, to: 7 }, color: "#eee" } ]
              }
            }
          );

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
           .where('?lr    sp:specimenCollected  ?bn4')
           .where('?bn4   sp:startDate          ?date')
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
           $.extend(true,
             pt.ur_tp_flot_opts,
             _flot_opts,
             {
               yaxis: {
                 min: 0,
                 max: 200,
                 ticks: [0, 50, 100, 150, 200],
                 tickLength: 0
               },
               grid: {
                 markings: [ { yaxis: { from: 200, to: 135 }, color: "#eee" } ]
               }
             }
           );

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
          .where('?lr    sp:specimenCollected  ?bn4')
          .where('?bn4   sp:startDate          ?date')
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
          $.extend(true,
            pt.m_alb_cre_ratio_flot_opts,
            _flot_opts,
            {
              yaxis: {
                min: 0,
                max: 50,
                ticks: [0, 10, 20, 30, 40, 50],
                tickLength: 0
              },
              grid: {
                markings: [ { yaxis: { from: 50, to: 30 }, color: "#eee" } ]
              }
            }
          );

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
          .where('?lr    sp:specimenCollected  ?bn4')
          .where('?bn4   sp:startDate          ?date')
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
          $.extend(true,
            pt.sgot_flot_opts,
            _flot_opts,
            {
              yaxis: {
                min: 0,
                max: 50,
                ticks: [0, 10, 20, 30, 40, 50],
                tickLength: 0
              },
              grid: {
                markings: [
                  { yaxis: { from: 0, to: 10 }, color: "#eee" },
                  { yaxis: { from: 50, to: 40 }, color: "#eee" }
                ]
              }
            }
          );

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
          .where('?lr    sp:specimenCollected  ?bn4')
          .where('?bn4   sp:startDate          ?date')
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
          $.extend(true,
            pt.chol_total_flot_opts,
            _flot_opts,
            {
              yaxis: {
                min: 0,
                max: 300,
                ticks: [0, 50, 100, 150, 200, 250, 300, 350],
                tickLength: 0
              },
              grid: {
                markings: [ { yaxis: { from: 350, to: 200 }, color: "#eee" } ]
              }
            }
          );

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
          .where('?lr    sp:specimenCollected  ?bn4')
          .where('?bn4   sp:startDate          ?date')
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
          $.extend(true,
            pt.triglyceride_flot_opts,
            _flot_opts,
            {
              yaxis: {
                min: 0,
                max: 250,
                ticks: [0, 50, 100, 150, 200, 250, 300],
                tickLength: 0
              },
              grid: {
                markings: [ { yaxis: { from: 300, to: 150 }, color: "#eee" } ]
              }
            }
          );

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
          .where('?lr    sp:specimenCollected  ?bn4')
          .where('?bn4   sp:startDate          ?date')
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
          $.extend(true,
            pt.hdl_flot_opts,
            _flot_opts,
            {
              yaxis: {
                min: 0,
                max: 150,
                ticks: [0, 50, 100, 150],
                tickLength: 0
              },
              grid: {
                markings: [ { yaxis: { from: 0, to: 40 }, color: "#eee" } ]
              }
            }
          );

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
          .where('?lr    sp:specimenCollected  ?bn4')
          .where('?bn4   sp:startDate          ?date')
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
          $.extend(true,
            pt.bun_flot_opts,
            _flot_opts,
            {
              yaxis: {
                min: 0,
                max: 35,
                ticks: [0, 5, 10, 15, 20, 25, 30, 35],
                tickLength: 0
              },
              grid: {
                markings: [
                  { yaxis: { from: 0, to: 8 }, color: "#eee" },
                  { yaxis: { from: 35, to: 25 }, color: "#eee" }
                ]
              }
            }
          );

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
          .where('?lr    sp:specimenCollected  ?bn4')
          .where('?bn4   sp:startDate          ?date')
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
          $.extend(true,
            pt.creatinine_flot_opts,
            _flot_opts,
            {
              yaxis: {
                min: 0,
                max: 2,
                ticks: [0, 0.5, 1, 1.5, 2],
                tickLength: 0
              },
              grid: {
                markings: [
                  { yaxis: { from: 0, to: 0.6 }, color: "#eee" },
                  { yaxis: { from: 2, to: 1.5 }, color: "#eee" }
                ]
              }
            }
          );

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
          .where('?lr    sp:specimenCollected  ?bn4')
          .where('?bn4   sp:startDate          ?date')
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
          $.extend(true,
            pt.glucose_flot_opts,
            _flot_opts,
            {
              yaxis: {
                min: 0,
                max: 300,
                ticks: [0, 50, 100, 150, 200, 250, 300],
                tickLength: 0
              },
              grid: {
                markings: [
                  { yaxis: { from: 0, to: 70 }, color: "#eee" },
                  { yaxis: { from: 300, to: 110 }, color: "#eee" }
                ]
              }
            }
          );

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
            'target_range_text_html': '&lt; 7%',
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
            'target_range_text_html': '&lt; 100mg/dl',
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
            'target_range_text_html': '&lt; 30', // FIXME: we don't really know this
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

         dfd.resolve();
      })
  }).promise();
};


var PROBLEMS_get = function(){
  return $.Deferred(function(dfd){
    SMART.PROBLEMS_get().then(function(r){
      _(r.objects.of_type.Problem).each(function(p){
        pt.problems_arr.push([
          new XDate(p.startDate)
        , p.problemName.dcterms__title
        , p.endDate ? new XDate(p.endDate) : null
        ])
      })
      pt.problems_arr = _(pt.problems_arr).sortBy(function(p){ return p[0]; })
      dfd.resolve();
    })
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
       , MEDICATIONS_get()
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
    $('#ur_tp_date').text(pt.ur_tp ? new XDate(pt.ur_tp[0]).toString('MM/dd/yy') : '-')
    $('#ur_tp_val') .text(pt.ur_tp ? pt.ur_tp[1] : null)
    $('#ur_tp_unit').text(pt.ur_tp ? pt.ur_tp[2] : null)

    $('#ur_tp_next_date').text(pt.ur_tp_next ? new XDate(pt.ur_tp_next[0]).toString('MM/dd/yy') : '-')
    $('#ur_tp_next_val') .text(pt.ur_tp_next ? pt.ur_tp_next[1] : null)
    $('#ur_tp_next_unit').text(pt.ur_tp_next ? pt.ur_tp_next[2] : null)

    $('#m_alb_cre_ratio_date').text(pt.m_alb_cre_ratio ? new XDate(pt.m_alb_cre_ratio[0]).toString('MM/dd/yy') : '-')
    $('#m_alb_cre_ratio_val') .text(pt.m_alb_cre_ratio ? pt.m_alb_cre_ratio[1] : null)
    $('#m_alb_cre_ratio_unit').text(pt.m_alb_cre_ratio ? pt.m_alb_cre_ratio[2] : null)

    $('#m_alb_cre_ratio_next_date').text(pt.m_alb_cre_ratio_next ? new XDate(pt.m_alb_cre_ratio_next[0]).toString('MM/dd/yy') : '-')
    $('#m_alb_cre_ratio_next_val') .text(pt.m_alb_cre_ratio_next ? pt.m_alb_cre_ratio_next[1] : null)
    $('#m_alb_cre_ratio_next_unit').text(pt.m_alb_cre_ratio_next ? pt.m_alb_cre_ratio_next[2] : null)

    $('#sgot_date').text(pt.sgot ? new XDate(pt.sgot[0]).toString('MM/dd/yy') : '-')
    $('#sgot_val') .text(pt.sgot ? pt.sgot[1] : null)
    $('#sgot_unit').text(pt.sgot ? pt.sgot[2] : null)

    $('#sgot_next_date').text(pt.sgot_next ? new XDate(pt.sgot_next[0]).toString('MM/dd/yy') : '-')
    $('#sgot_next_val') .text(pt.sgot_next ? pt.sgot_next[1] : null)
    $('#sgot_next_unit').text(pt.sgot_next ? pt.sgot_next[2] : null)

    $('#chol_total_date').text(pt.chol_total ? new XDate(pt.chol_total[0]).toString('MM/dd/yy') : '-')
    $('#chol_total_val') .text(pt.chol_total ? pt.chol_total[1] : null)
    $('#chol_total_unit').text(pt.chol_total ? pt.chol_total[2] : null)

    $('#chol_total_next_date').text(pt.chol_total_next ? new XDate(pt.chol_total_next[0]).toString('MM/dd/yy') : '-')
    $('#chol_total_next_val') .text(pt.chol_total_next ? pt.chol_total_next[1] : null)
    $('#chol_total_next_unit').text(pt.chol_total_next ? pt.chol_total_next[2] : null)

    $('#triglyceride_date').text(pt.triglyceride ? new XDate(pt.triglyceride[0]).toString('MM/dd/yy') : '-')
    $('#triglyceride_val') .text(pt.triglyceride ? pt.triglyceride[1] : null)
    $('#triglyceride_unit').text(pt.triglyceride ? pt.triglyceride[2] : null)

    $('#triglyceride_next_date').text(pt.triglyceride_next ? new XDate(pt.triglyceride_next[0]).toString('MM/dd/yy') : '-')
    $('#triglyceride_next_val') .text(pt.triglyceride_next ? pt.triglyceride_next[1] : null)
    $('#triglyceride_next_unit').text(pt.triglyceride_next ? pt.triglyceride_next[2] : null)

    $('#hdl_date').text(pt.hdl ? new XDate(pt.hdl[0]).toString('MM/dd/yy') : '-')
    $('#hdl_val') .text(pt.hdl ? pt.hdl[1] : null)
    $('#hdl_unit').text(pt.hdl ? pt.hdl[2] : null)

    $('#hdl_next_date').text(pt.hdl_next ? new XDate(pt.hdl_next[0]).toString('MM/dd/yy') : '-')
    $('#hdl_next_val') .text(pt.hdl_next ? pt.hdl_next[1] : null)
    $('#hdl_next_unit').text(pt.hdl_next ? pt.hdl_next[2] : null)

    $('#ldl_date').text(pt.ldl ? new XDate(pt.ldl[0]).toString('MM/dd/yy') : '-')
    $('#ldl_val') .text(pt.ldl ? pt.ldl[1] : null)
    $('#ldl_unit').text(pt.ldl ? pt.ldl[2] : null)

    $('#ldl_next_date').text(pt.ldl_next ? new XDate(pt.ldl_next[0]).toString('MM/dd/yy') : '-')
    $('#ldl_next_val') .text(pt.ldl_next ? pt.ldl_next[1] : null)
    $('#ldl_next_unit').text(pt.ldl_next ? pt.ldl_next[2] : null)

    $('#bun_date').text(pt.bun ? new XDate(pt.bun[0]).toString('MM/dd/yy') : '-')
    $('#bun_val') .text(pt.bun ? pt.bun[1] : null)
    $('#bun_unit').text(pt.bun ? pt.bun[2] : null)

    $('#bun_next_date').text(pt.bun_next ? new XDate(pt.bun_next[0]).toString('MM/dd/yy') : '-')
    $('#bun_next_val') .text(pt.bun_next ? pt.bun_next[1] : null)
    $('#bun_next_unit').text(pt.bun_next ? pt.bun_next[2] : null)

    $('#creatinine_date').text(pt.creatinine ? new XDate(pt.creatinine[0]).toString('MM/dd/yy') : '-')
    $('#creatinine_val') .text(pt.creatinine ? pt.creatinine[1] : null)
    $('#creatinine_unit').text(pt.creatinine ? pt.creatinine[2] : null)

    $('#creatinine_next_date').text(pt.creatinine_next ? new XDate(pt.creatinine_next[0]).toString('MM/dd/yy') : '-')
    $('#creatinine_next_val') .text(pt.creatinine_next ? pt.creatinine_next[1] : null)
    $('#creatinine_next_unit').text(pt.creatinine_next ? pt.creatinine_next[2] : null)

    $('#glucose_date').text(pt.glucose ? new XDate(pt.glucose[0]).toString('MM/dd/yy') : '-')
    $('#glucose_val') .text(pt.glucose ? pt.glucose[1] : null)
    $('#glucose_unit').text(pt.glucose ? pt.glucose[2] : null)

    $('#glucose_next_date').text(pt.glucose_next ? new XDate(pt.glucose_next[0]).toString('MM/dd/yy') : '-')
    $('#glucose_next_val') .text(pt.glucose_next ? pt.glucose_next[1] : null)
    $('#glucose_next_unit').text(pt.glucose_next ? pt.glucose_next[2] : null)

    $('#a1c_date').text(pt.a1c ? new XDate(pt.a1c[0]).toString('MM/dd/yy') : '-')
    $('#a1c_val') .text(pt.a1c ? pt.a1c[1] : null)
    $('#a1c_unit').text(pt.a1c ? pt.a1c[2] : null)

    $('#a1c_next_date').text(pt.a1c_next ? new XDate(pt.a1c_next[0]).toString('MM/dd/yy') : '-')
    $('#a1c_next_val') .text(pt.a1c_next ? pt.a1c_next[1] : null)
    $('#a1c_next_unit').text(pt.a1c_next ? pt.a1c_next[2] : null)

    // other info
    $('#weight_date').text(pt.weight ? new XDate(pt.weight[0]).toString('MM/dd/yy') : null)

    var weight_val_lb = pt.weight[2] === 'kg' ? pt.weight[1] * 2.2 : null
    weight_val_lb = weight_val_lb < 22 ? _round(weight_val_lb, 1) : _round(weight_val_lb, 0)
    var weight_val_kg = pt.weight[1] || null
    weight_val_kg = weight_val_kg < 10 ? _round(weight_val_kg, 1) : _round(weight_val_kg, 0)
    $('#weight_val_lb').text(weight_val_lb || 'Unk')
    $('#weight_val_kg').text(weight_val_kg || 'Unk')

    var highlight = function(lab_variable, id_strings){
      var today = new XDate();
      var d = new XDate(lab_variable[0]);
      var overdue_p = false;
      if (Math.round(d.diffMonths(today)) > 12) {
        _(id_strings).each(function(idstr){ $(idstr).addClass('highlight'); })
      }
    }
    highlight(pt.weight, ['#weight_date']);

    var height_val_in = pt.height[2] === 'm' ? _round(pt.height[1]  / .0254, 0) : null
    var height_val_cm = _round(pt.height[1] * 100, 0) || null
    $('#height_date').text(pt.height ? new XDate(pt.height[0]).toString('MM/dd/yy') : null)
    $('#height_val_in').text(height_val_in || 'Unknown')
    $('#height_val_cm').text(height_val_cm || 'Unknown')
    highlight(pt.height, ['#height_date']);

    // Fixme: NO pneumovax or flu codes in the current pts...
    if (!pt.pneumovax_date) { $('#pneumovax_date').text('Unknown'); }
    if (!pt.flu_shot_date) { $('#flu_shot_date').text('Unknown'); }

    //
    // Problems
    //
    // Get the complete list, then partition into cv_comorbidities, other, and resolved
    // with no repeats among sublists. Show active and resolved numbers only if that
    // problem has both active and resolved numbers to show

    if (pt.problems_arr.length == 0) {
      $('<div></div>', {text: 'None known'}).css('padding-left', '12px').appendTo('#other_problems');
      $('<div></div>', {text: 'None known'}).css('padding-left', '12px').appendTo('#resolved_problems');
    }

    var do_stripes = function(){
      $('.cv_comorbidity, .allergy, .problem, .medication, .reminder').each(function(i,e){ $(e).css({'background-color': ''}); })
      $('.cv_comorbidity').filter(':odd').each(function(i,e){ $(e).css({'background-color': '#ebebeb'}); })
      $('.allergy').filter(':odd').each(function(i,e){ $(e).css({'background-color': '#ebebeb'}); })
      $('.problem').filter(':odd').each(function(i,e){ $(e).css({'background-color': '#ebebeb'}); })
      $('.resolved_problem').filter(':odd').each(function(i,e){ $(e).css({'background-color': '#ebebeb'}); })
      $('.medication').filter(':odd').each(function(i,e){ $(e).css({'background-color': '#ebebeb'}); })
      $('.reminder').filter(':odd').each(function(i,e){ $(e).css({'background-color': '#ebebeb'}); })
    }

    // (some) cv comorbidities
    // fixme: I'm sure there are many more...
    // http://www.ncbi.nlm.nih.gov/pmc/articles/PMC550650/
    var partition_comorbidities = function(){
      $('#cv_comorbidities').empty();

      var cv_comorbidities = _($('#other_problems .problem'))
        .chain()
        .filter(function(e) {
          var title = $(e).text();
          if (title.match(/heart disease/i)) return true;
          if (title.match(/Congestive Heart Failure/i)) return true;
          if (title.match(/Myocardial Infarction/i)) return true;
          if (title.match(/Cerebrovascular Disease /i)) return true;
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
        .map(function(e){
          new_e = $(e).clone(true); // with data
          $(e).remove();
          return new_e;
        })
        .value()

      if (cv_comorbidities.length == 0) { $('<div></div>', {text: 'No current CV comorbidities'}).css('padding-left', '12px').appendTo('#cv_comorbidities'); }
      _(cv_comorbidities).each(function(e){
        e.addClass('cv_comorbidity').appendTo('#cv_comorbidities')
      })

    }

    var partition_resolved = function(){
      $('#resolved_problems').empty();
      var resolved_problems = _($('#other_problems .resolved'))
        .map(function(e){
          new_e = $(e).clone(true); // with data
          $(e).remove();
          return new_e;
        })

      if (resolved_problems.length == 0) { $('<div></div>', {text: 'None known'}).css('padding-left', '12px').appendTo('#resolved_problems'); }
      _(resolved_problems).each(function(e){
        e.addClass('resolved_problem').appendTo('#resolved_problems')
      })
    }

    var _add_dates_to_resolved = function(){
      _($('.resolved')).each(function(e){
        e = $(e);
        var resolved_date = new XDate(e.data('2')).toString('MM/dd/yy')
        e.html(e.html() + ' <span class="smaller">('+resolved_date+')</span>')
      })
    }

    // this is the only function that generates elements from the actual pt.problems_arr
    var sort_by_alpha = function(){
      // de-bounce
      if (pt.current_sort == 'alpha') return;
      pt.current_sort = 'alpha';
      $('#problems, #resolved_problems, #cv_comorbidities, #other_problems').empty()

      // do two counts: (number current (no enddate), number resolved (has enddate))
      // note: e[2] is endDate or null, e[3] count of resolved, e[4] count of activee

      // 1. Attach active_n and resolved_n data to each element and put into #other_problems
      _(pt.problems_arr)
        .chain()
        .sortBy(function(e){ return e[1]; })
        .map(function(e){
            // count resolved
            var f = _(pt.problems_arr).filter(function(e2){ return (e[1] === e2[1] && e2[2] != null); })
            e[3] = f.length;
            return e;
        })
        .map(function(e){
            // count active
            var f = _(pt.problems_arr).filter(function(e2){ return (e[1] === e2[1] && e2[2] == null); })
            e[4] = f.length;
            return e;
        })
        .each(function(e){
          // is this a resolved problem? Note: we can't just look at the resolved_n
          // since this might not be the one that's resolved
          var c = 'active';
          if (e[3] > 0 && e[2]) { c = 'resolved'; }
          $('<div></div>', { 'class': c, 'html': e[1] })
            .addClass('problem')
            .data(e)
            .appendTo('#other_problems')
        })
        .value()

      // 2. Move resolved elements to #resolved_problems
      partition_resolved()

      // 3. Add counts to each element based on what list it is in
      var _add_counts = function(list_id){
        var children = $(list_id).children();
        _(children)
          .each(function(e){
            e = $(e);
            var count_to_use = e.data('4');
            if (list_id === '#resolved_problems') { count_to_use = e.data('3'); }
            if (count_to_use > 1) { e.text(e.text()+' ('+count_to_use+')') }
          })
      }

      _add_counts('#resolved_problems');
      _add_counts('#other_problems');

      var _de_duplicate_problem_list = function(el){
        var clones = _(el.children())
          .chain()
          .uniq(true, function(e){ return $(e).data('1'); })
          .map(function(e){
            new_e = $(e).clone(true); // with data
            $(e).remove();
            return new_e;
          })
          .value()

        $(el).empty();
        _(clones).each(function(clone){ $(clone).appendTo(el); })
      }

      // 4. De-dup both lists individually
      _de_duplicate_problem_list($('#other_problems'));
      _de_duplicate_problem_list($('#resolved_problems'));

      // 5. Move CV comorbidities into #cv_comorbidities
      partition_comorbidities();

      // 6. _add_dates_to_resolved
      _add_dates_to_resolved();

      // show diabetic info in demos line
      var d = $('.problem:contains("Diabetes")');
      if (d.length > 0) {
        d.addClass('highlight');
        $('#diabetic_info').text('Diabetic');
        // active diabetic?
        var date_of_oldest_active_diabetes = _(pt.problems_arr)
          .chain()
          .filter(function(e) {
            if (e[1].match(/diabetes/i) && !e[2]) return true;
            else return false;
          })
          .map(function(e){ return e[0]; })
          .sortBy(function(e){ return e; })
          .first()
          .value()

          if (date_of_oldest_active_diabetes) {
            var today = new XDate();
            var d = new XDate(date_of_oldest_active_diabetes)
            var years_ago = Math.round(d.diffYears(today));
            var date = d.toString('MM/dd/yy')
            $('#diabetic_dates').text('diagnosed '+date+' (>'+years_ago+' years)')
          }
      }

      // add "as of" date of problems section header
      var el = _(pt.problems_arr).max(function(e){ return e[2] || e[0]; })
      var d = new XDate(el[2] || el[0]);
      $('#as_of').html('<span class="smaller">'+d.toString('MM/dd/yy')+'</span>')

      // medications
      $('#medications').empty()
      if (pt.meds_arr.length == 0) { $('<div/>', {text: 'No known medications'}).appendTo('#medications'); }
      _(pt.meds_arr).chain()
        .sortBy(function(e){ return e[1].toLowerCase(); })
        .each(function(e){
          var a = e[1].split(' ')
          $('<div></div>', {
            'class': 'medication',
            html: '<span>' + a[0] + '</span> <span style="color: gray">&middot; ' + _(a).rest().join(' ') + ' &middot; ' + e[2] + '</span>'
          })
          .data(e)
          .appendTo('#medications')
        })
        .value()
        do_stripes()
    };
    
    // allergies
    if (pt.allergies_arr.length == 0) { $('<div/>', {text: 'No known allergies'}).appendTo('#allergies'); }
    _(pt.allergies_arr).each(function(e){
      $('<div></div>', {
        'class': 'allergy',
        html: '<span class=\'bold\'>' + e[0] + '</span> ' + e[1]
      })
      .data(e)
      .appendTo('#allergies')
    })

    //
    // display by date
    //
    // note: we assume that we've sorted by alpha (and nodes exist) first

    var sort_by_date = function(){
      // de-bounce
      if (pt.current_sort === 'date') return;
      pt.current_sort = 'date';

      // move all the partitioned problems back to the hidden #problems div
      _($('#resolved_problems, #cv_comorbidities, #other_problems').children())
        .each(function(e){
          var p = $(e).clone(true); // with data
          $(p).appendTo('#problems');
          $(e).remove();
        })

      // prepend date to all problems (or get attached data)
      var p2 =_($('#problems').children()).chain()
        .map(function(e){
          e = $(e)
          var date = e.data('0') ? new XDate(e.data('0')).toString('MM/dd/yy') : '';
          var h = '<span class="date">'+date+'</span>';
          return e.html(h+' '+e.html())
        })
        .sortBy(function(e){ return $(e).data('0'); })
        .reverse()
        .value()

      // put in other_problems, then partition to other lists
      _(p2).each(function(e){ $(e).appendTo('#other_problems'); })

      $('.problem:contains("Diabetes")').addClass('highlight');

      // do resolved first
      partition_resolved()
      partition_comorbidities();

      // do meds
      var m2 =_($('.medication')).chain()
        .map(function(e){
          e = $(e)
          var date = e.data('0') ? new XDate(e.data('0')).toString('MM/dd/yy') : '';
          var h = '<span class="date">'+date+'</span>';
          return e.html(h+' '+e.html())
        })
        .sortBy(function(e){ return $(e).data('0'); })
        .reverse()
        .value()

      $('#medications').empty();
      _(m2).each(function(e){ $(e).appendTo('#medications'); })
      do_stripes();
    };

    
    //
    // reminders
    //
    if (pt.reminders_arr.length == 0) { $('<div/>', {text: 'No current reminders'}).appendTo('#reminders'); }
    _(pt.reminders_arr).each(function(e){
      // todo: use templating here
      var html = '<span class=\'bold\'>' + e.title_html + '</span> ';
      if (e.overdue_p) {
        html = html + '<span class=\'highlight\'>&bull; '  + e.reminder_html + ' &bull;</span> <br />';
      }

      var d = new XDate(e.lab_variable[0])
      html = html + e.lab_name_html + ' last tested ' + d.toString('MM/dd/yy') +
             ' (' + e.months_ago + ' months ago) '

       if (e.overdue_p) {
         html = html + '<span class=\'highlight\'>&bull; dated &bull;</span> <br />';
       }

       // faked table alignment
       html = html + '<span style="color: #fff" class="hidden">' + e.lab_name_html + '</span> last result ' + e.lab_variable[1] + e.lab_variable[2] 
                   + ' (goal ' + e.target_range_text_html + ')'

      if (!e.in_range_p) {
        html = html + ' <span class=\'highlight\'>&bull; out of target range &bull; </span>'
      }

      $('<div></div>', {
        class: 'reminder',
        html: html
      }).appendTo('#reminders')
    })

    // hide lab name for nicer alignment by setting to background
    _($('.hidden')).each(function(e){
      var parent = $(e).parent();
      $(e).css('color', $(parent).css('background-color'));
    })

    sort_by_alpha();

    var draw_plots = function(callback){
      // set the heights for the graphs and set the (fluid) width
      // of the a1c graph to be the same as the other graphs
      var h = 100;
      $('#bp_graph') .height(h);
      $('#ldl_graph').height(h);
      $('#a1c_graph').height(h).width('100%')

      // fixme: hack to boost pediatric bps to adult bps if ago over 10y
      var b = new XDate(pt.bday)
      var age = Math.round(b.diffYears(new XDate()));

      if (age > 10) {
        pt.dbp_arr = _(pt.dbp_arr).map(function(e){
          e[1] = e[1] + 30;
          return e;
        })
        pt.sbp_arr = _(pt.sbp_arr).map(function(e){
          e[1] = e[1] + 30;
          return e;
        })
      }

      // plot'em!
      $.plot($("#bp_graph"),  [pt.dbp_arr, pt.sbp_arr], pt.bp_flot_opts);
      $.plot($("#ldl_graph"), [pt.ldl_arr],             pt.ldl_flot_opts);
      $.plot($("#a1c_graph"), [pt.a1c_arr],             pt.a1c_flot_opts);

      // fixme: dry
      $.plot($("#ur_tp_graph"),           [pt.ur_tp_arr],           pt.ur_tp_flot_opts);
      $.plot($("#m_alb_cre_ratio_graph"), [pt.m_alb_cre_ratio_arr], pt.m_alb_cre_ratio_flot_opts);
      $.plot($("#sgot_graph"),            [pt.sgot_arr],            pt.sgot_flot_opts);
      $.plot($("#chol_total_graph"),      [pt.chol_total_arr],      pt.chol_total_flot_opts);
      $.plot($("#triglyceride_graph"),    [pt.triglyceride_arr],    pt.triglyceride_flot_opts);
      $.plot($("#hdl_graph"),             [pt.hdl_arr],             pt.hdl_flot_opts);
      $.plot($("#ldl_graph_lkv"),         [pt.ldl_arr],             pt.ldl_flot_opts);
      $.plot($("#bun_graph"),             [pt.bun_arr],             pt.bun_flot_opts);
      $.plot($("#creatinine_graph"),      [pt.creatinine_arr],      pt.creatinine_flot_opts);
      $.plot($("#glucose_graph"),         [pt.glucose_arr],         pt.glucose_flot_opts);
      $.plot($("#a1c_graph_lkv"),         [pt.a1c_arr],             pt.a1c_flot_opts);
    };

    draw_plots();

    // clone demo line into lkv popup
    $('#lkv_top_line').html($('#top_line').html())

    // events
    $('#sort_by_date').on('click',  function(){
      $('#sort_by_date').hide()
      $('#sort_by_alpha').show()
      sort_by_date();
      return false;
    });
    $('#sort_by_alpha').on('click', function(){
      $('#sort_by_alpha').hide()
      $('#sort_by_date').show()
      sort_by_alpha();
      return false;
    });

    $('#color_controls_link').on('click', function(){
      alert('Work in progress... Coming soon.');
      return false;
    })

    $("#show_overlay[rel]").overlay();
  });
});
