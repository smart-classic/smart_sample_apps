'use strict';

/* Patient model (Smart interface)
Note that there are no dependencies for this module (as it should be)
*/
var DMPatientServices = angular.module('DM.PatientServices', []);

DMPatientServices.factory('$dmPatient', function () {
    return {
        patient: {},
        get_demographics: function () {
            var patient = this.patient;
            return $.Deferred(function (dfd) {
                SMART.get_demographics().then(function (r) {
                    var name = r.objects.of_type.vcard__Name[0];
                    var demos = r.objects.of_type.Demographics[0];
                    patient.familyName = name.vcard__family_name;
                    patient.givenName = name.vcard__given_name;
                    patient.gender = demos.foaf__gender;
                    patient.bday = demos.vcard__bday;
                    dfd.resolve();
                })
            }).promise();
        },

        get_medications: function () {
            var patient = this.patient;
            return $.Deferred(function (dfd) {
                SMART.get_medications().then(function (r) {
                    patient.medicines = [];
                    _(r.objects.of_type.Medication).each(function (m) {
                        var med = { "rxCui": m.drugName.code.dcterms__identifier, "rxName": m.drugName.dcterms__title, "ins": m.instructions, "startDate": m.startDate };
                        patient.medicines.push(med);
                    })
                    patient.medicines = _(patient.medicines).chain().sortBy(function (p) {
                        return p.rxName.toLowerCase();
                    }).map(function (med) {
                        var a = med.rxName.split(' ');
                        med.rxName = a[0];
                        med.strengthAndDoseForm = _(a).rest().join(' ');
                        return med;
                    }).value();

                    dfd.resolve();
                })
            }).promise();
        },

        get_problems: function () {
            var patient = this.patient;
            return $.Deferred(function (dfd) {
                SMART.get_problems().then(function (r) {
                    patient.problems = [];
                    _(r.objects.of_type.Problem).each(function (p) {
                        var problem = { "CID": p.problemName.code.dcterms__identifier, "name": p.problemName.dcterms__title };
                        var title = problem.name;
                        // THIS WILL BE A SEMANTIC SERVER FUNCTION (?)
                        if ((title.match(/heart disease/i)) || (title.match(/Congestive Heart Failure/i)) || (title.match(/Myocardial Infarction/i))
                            || (title.match(/Cerebrovascular Disease /i)) || (title.match(/Hypertension/i)) || (title.match(/neuropathic pain/i))
                            || (title.match(/coronary arteriosclerosis/i)) || (title.match(/chronic renal impariment/i)) || (title.match(/cardiac bypass graft surgery/i))
                            || (title.match(/Preinfarction syndrome/i)) || (title.match(/Chest pain/i)) || (title.match(/Chronic ischemic heart disease/i))
                            || (title.match(/Disorder of cardiovascular system/i)) || (title.match(/Precordial pain/i)))
                            problem.category = "CoMorbidity";
                        else
                            problem.category = "Normal";
                        problem.startDate = p.startDate;
                        patient.problems.push(problem);
                    })
                    patient.problems = _(patient.problems).sortBy(function (p) {
                        return p.problemName;
                    })

                    dfd.resolve();
                })
            }).promise();
        },

        get_allergies: function () {
            var patient = this.patient;
            return $.Deferred(function (dfd) {
                SMART.get_allergies().then(function (r) {
                    patient.allergies = [];
                    _(r.objects.of_type.Allergy).each(function (a) {
                        var allergen = a.drugClassAllergen || a.foodAllergen;
                        if (allergen) {
                            allergy = { "allergen": allergen.dcterms__title, "reaction": a.allergicReaction.dcterms__title };
                            patient.allergies.push(allergy);
                        }
                    })
                    dfd.resolve();
                })
            }).promise();
        },
        
        get_lab_results: function () {
            var patient = this.patient;
            return $.Deferred(function (dfd) {
                SMART.get_lab_results().then(function (r) {
                    patient.labs = [];
                    var results = r.objects.of_type.LabResult;

                    _(results).chain().sortBy(function (l) {
                        return l.labName.dcterms__title
                    }).each(function (l) {
                        if (l.quantitativeResult) {
                            var data = [];
                            var d = new XDate(l.dcterms__date).addYears(4, true);
                            var flag = Number(l.quantitativeResult.valueAndUnit.value) <= Number(l.quantitativeResult.normalRange.minimum.value) || Number(l.quantitativeResult.valueAndUnit.value) >= Number(l.quantitativeResult.normalRange.maximum.value);
                            data.push({ "shortdate": d.toString('MM/dd/yy'), "date": d.toString('MM/dd/yyyy'), "value": l.quantitativeResult.valueAndUnit.value, "flag": flag });

                            var lab = _.find(patient.labs, function (lab) {
                                return lab.loinc == l.labName.code.dcterms__identifier
                            });
                            if (lab) {
                                flag = Number(l.quantitativeResult.valueAndUnit.value) <= Number(lab.min) || Number(l.quantitativeResult.valueAndUnit.value) >= Number(lab.max);
                                lab.data.push({ "shortdate": d.toString('MM/dd/yy'), "date": d.toString('MM/dd/yyyy'), "value": l.quantitativeResult.valueAndUnit.value, "flag": flag });
                            }
                            else {
                                lab = {
                                    "loinc": l.labName.code.dcterms__identifier,
                                    "name": l.labName.dcterms__title,
                                    "units": l.quantitativeResult.valueAndUnit.unit,
                                    "range": l.quantitativeResult.normalRange.minimum.value + "-" + l.quantitativeResult.normalRange.maximum.value,
                                    "min": l.quantitativeResult.normalRange.minimum.value,
                                    "max": l.quantitativeResult.normalRange.maximum.value,
                                    "data": data

                                };
                                patient.labs.push(lab);
                            }
                        }
                    }).value();
                    dfd.resolve();
                }) 
            }).promise();
        },

        get_vital_sign_sets: function () {
            var patient = this.patient;
            return $.Deferred(function(dfd) {
                SMART.get_vital_sign_sets().then(function (r) {
                    patient.vitals = [];

                    (function bpsys() {
                        var data = _(r.objects.of_type.VitalSignSet).chain()
                        .filter(function (v) {
                            return v.bloodPressure;
                        })
                        .filter(function (v) {
                            return v.bloodPressure.systolic;
                        })
                        .map(function (v) {
                            var d = new XDate(v.dcterms__date).addYears(3, true);
                            return {
                                "date": d.toString('MM/dd/yyyy'),
                                "value":Number(v.bloodPressure.systolic.value)
                                 
                            };
                        }).value()
                       
                        patient.vitals.push({ "name": "bloodPressure", "subName": "systolic", "units": "mm[Hg]", "data":data });
                    })();
                    (function bpdia() {
                        var data = _(r.objects.of_type.VitalSignSet).chain()
                        .filter(function (v) {
                            return v.bloodPressure;
                        })
                        .filter(function (v) {
                            return v.bloodPressure.diastolic;
                        })
                        .map(function (v) {
                            var d = new XDate(v.dcterms__date).addYears(3, true);
                            return {
                                "date": d.toString('MM/dd/yyyy'),
                                "value": Number(v.bloodPressure.diastolic.value)
                                 
                            };
                        }).value()

                        patient.vitals.push({ "name": "bloodPressure", "subName": "diastolic", "units": "mm[Hg]", "data": data });
                    })();
                    (function weights() {
                        var units;
                        var data = _(r.objects.of_type.VitalSignSet).chain()
                           
                        .filter(function (v) {
                            return v.weight;
                        })
                        .sortBy(function (v) {
                            return v.dcterms__date || null
                        })
                            
                        .map(function(v) {
                            var d = new XDate(v.dcterms__date).addYears(3, true);
                            units = v.weight.unit;
                            return {
                                "date": d.toString('MM/dd/yyyy'),
                                "value": (v.weight.value)
                                 
                            };
                        }).value()
                        patient.vitals.push({ "name": "weight", "units": units, "data": data });
                    })();
                    (function heights() {
                        var units;
                        var data = _(r.objects.of_type.VitalSignSet).chain()
                            
                        .filter(function (v) {
                            return v.height;
                        })
                        .sortBy(function (v) {
                            return v.dcterms__date || null
                        })
                            
                        .map(function (v) {
                            var d = new XDate(v.dcterms__date).addYears(3, true);
                            units = v.height.unit;
                            return {
                                "date": d.toString('MM/dd/yyyy'),
                                "value": Number(v.height.value)

                            };
                        }).value()
                        patient.vitals.push({ "name": "height", "units": units, "data": data });
                    })();
                        
                    dfd.resolve();
                });
            }).promise();
        },

        // PATIENT SCHEMA AND TEST DATA FOR OUT-OF-CONTAINER DEVELOPMENT 
        getFromJSON: function () {
            this.patient = {
                "medicalRecordNumber": 34,
                "givenName": "William",
                "familyName": "Robinson",
                "bday": "1965-08-09",
                "age": "47",
                "gender": "M",
                "medicines":[
                    { "rxCui": "197381", "rxName": "Atenolol", "strengthAndDoseForm": "50 MG Oral Tablet", "ins": "1 daily", "startDate": "2012-08-20" },
                    { "rxCui": "213469", "rxName": "Celecoxib", "strengthAndDoseForm": "200 MG Oral Capsule [Celebrex]", "ins": "1 daily", "startDate": "2012-08-19" },
                    { "rxCui": "795735", "rxName": "Chantix", "strengthAndDoseForm": "Continuing Months Of Therapy Pack", "ins": "1 daily", "startDate": "2012-08-18" },
                    { "rxCui": "259543", "rxName": "Clarithromycin", "strengthAndDoseForm": "500 MG Extended Release Tablet", "ins": "1 bid", "startDate": "2012-08-17" },
                    { "rxCui": "213169", "rxName": "Clopidogrel", "strengthAndDoseForm": "75 MG Oral Tablet [Plavix]", "ins": "1 daily", "startDate": "2012-08-16" },
                    { "rxCui": "199026", "rxName": "Doxycycline ", "strengthAndDoseForm": "100 MG Oral Capsule", "ins": "1 bid", "startDate": "2012-08-15" },
                    { "rxCui": "199247", "rxName": "Glimepiride ", "strengthAndDoseForm": "4 MG Oral Tablet", "ins": "1 daily", "startDate": "2012-08-14" },
                    { "rxCui": "860981", "rxName": "Metformin", "strengthAndDoseForm": "750 MG Extended Release Tablet", "ins": "1 bid", "startDate": "2012-08-13" },
                    { "rxCui": "1098135", "rxName": "Niacin", "strengthAndDoseForm": "1000 MG Extended Release Tablet [Niaspan]", "ins": "1 qhs", "startDate": "2012-08-12" },
                    { "rxCui": "198039", "rxName": "Nitroglycerin", "strengthAndDoseForm": "0.4 MG Sublingual Tablet", "ins": "1 sl q5min x3 prn angina", "startDate": "2012-08-11" },
                    { "rxCui": "314200", "rxName": "Pantoprazole", "strengthAndDoseForm": "40 MG Enteric Coated Tablet", "ins": "1 daily", "startDate": "2012-08-10" },
                    { "rxCui": "859046", "rxName": "Pramipexole", "strengthAndDoseForm": "0.5 MG Oral Tablet [Mirapex]", "ins": "1 tid", "startDate": "2012-08-09" },
                    { "rxCui": "260333", "rxName": "Ramipril", "strengthAndDoseForm": "10 MG Oral Capsule [Altace]", "ins": "1 daily", "startDate": "2012-08-08" },
                    { "rxCui": "859749", "rxName": "Rosuvastatin", "strengthAndDoseForm": "10 MG Oral Tablet [Crestor]", "ins": "1 qhs", "startDate": "2012-08-07" },
                    { "rxCui": "198211", "rxName": "Simvastatin", "strengthAndDoseForm": "40 MG Oral Tablet", "ins": "1 qhs", "startDate": "2012-08-06" }
                ],
                "problems":[
                    { "CID": "1201005", "name": "Benign essential hypertension", "category": "Normal", startDate: '1/1/2000' },
                    { "CID": "29857009", "name": "Chest pain", "category": "Normal", startDate: '1/1/2000' },
                    { "CID": "429673002", "name": "Coronary arteriosclerosis", "category": "Normal", startDate: '1/1/2000' },
                    { "CID": "59621000", "name": "Essential hypertension", "category": "Normal", startDate: '1/1/2000' },
                    { "CID": "4557003", "name": "Preinfarction syndrome", "category": "Normal", startDate: '1/1/2000' },
                    { "CID": "195967001", "name": "Asthma", "category": "Normal", startDate: '1/1/2000' },
                    { "CID": "44054006", "name": "Diabetes mellitus type 2", "category": "Normal", startDate: '1/1/2000' },
                    { "CID": "55822004", "name": "Hyperlipidemia", "category": "Normal", startDate: '1/1/2000' },
                    { "CID": "43339004", "name": "Hypokalemia", "category": "Normal", startDate: '1/1/2000' },
                    { "CID": "185903001", "name": "Needs influenza immunization", "category": "Normal", startDate: '1/1/2000' },
                    { "CID": "267432004", "name": "Pure hypercholesterolemia", "category": "Normal", startDate: '1/1/2000' },
                    { "CID": "73430006", "name": "Unspecified sleep apnea", "category": "Normal", startDate: '1/1/2000' },
                    { "CID": "4557003", "name": "Preinfarction syndrome", "category": "Normal", startDate: '1/1/2000' },
                ],
                "allergies":[
                    { "allergen": "Soap", "reaction": "Skin rash" }

                ],

                "otherinfo":[
                    { "date": "-", "name": "Foot exam", "value": "", "units": "" },
                    { "date": "-", "name": "Eye exam", "value": "", "units": "" },
                    { "date": "-", "name": "Tobacco", "value": "Smoker", "units": "" },
                    { "date": "-", "name": "Aspirin", "value": "", "units": "" },
                    { "date": "-", "name": "ACE/ARB", "value": "", "units": "" },
                    { "date": "-", "name": "Last pneumovax", "value": "", "units": "" },
                    { "date": "05/12/2012", "name": "Last flu shot", "value": "", "units": "" }
                ],
                "vaccinations":[

                    { "date": "Unknown", "name": "last pneumovax", "value": "", "units": "" },
                    { "date": "Unknown", "name": "last flu shot", "value": "", "units": "" }
                ],
                "reminders":[
                    {
                        "title_html": "glycemia",
                        "reminder_html": "Consider checking A1C today",
                        "reminder_for_pt_html": "Find out how to lower your A1C to control your blood sugar today",
                        "lab_variable": "",
                        "lab_name_html": "A1C",
                        "target_min": 0,
                        "target_max": 7,
                        "target_unit": "%",
                        "target_range_text_html": "&lt; 7%",
                        "overdue_in_months": 6,
                        "extra_info_html": null
                    },{
                        "title_html": "lipids",
                        "reminder_html": "Consider checking lipids today",
                        "reminder_for_pt_html": "Find out how to lower your LDL levels today",
                        "lab_variable": "",
                        "lab_name_html": "LDL",
                        "target_min": 0,
                        "target_max": 100,
                        "target_unit": "mg/dL",
                        "target_range_text_html": "&lt; 100mg/dL",
                        "overdue_in_months": 6,
                        "extra_info_html": "Consider more aggressive target of &lt; 70 (established CAD)."
                    },{
                        "title_html": "albuminuria",
                        "reminder_html": "Consider checking urine &micro;alb/cre ratio today",
                        "lab_variable": "",
                        "lab_name_html": "urine &alb/cre ratio",
                        "target_min": 0,
                        "target_max": 30,
                        "target_unit": "mg/g",
                        "target_range_text_html": "&lt; 30",
                        "overdue_in_months": 6,
                        "extra_info_html": "&micro;alb/cre ratio test preferred over non-ratio &micro;alp screening tests."
                    }
                ],

                "vitals":[
                    {
                        "name": "heartRate", "units": "{beats}/min", "data": [
                            { "date": "10/24/2011", "value": "60" }, { "date": "10/24/2010", "value": "66" }
                        ]
                    },{
                        "name": "bloodPressure", "subName": "diastolic", "units": "mm[Hg]", "data": [
                            { "date": "10/24/2011", "value": "86" }, { "date": "12/12/2012", "value": "92" }
                        ]
                    },{
                        "name": "bloodPressure", "subName": "systolic", "units": "mm[Hg]", "data": [
                            { "date": "10/24/2011", "value": "128" }, { "date": "12/12/2012", "value": "126" }
                        ]
                    },{
                        "name": "weight", "units": "lb", "data": [
                            { "date": "10/24/2011", "value": "182" }, { "date": "12/12/2012", "value": "180" }
                        ]
                    },{
                        "name": "height", "units": "in", "data": [
                            { "date": "10/24/2011", "value": "72" }, { "date": "12/12/2012", "value": "72" }
                        ]
                    }

                ],
                "labs":[
                    {
                        "loinc": "5804-0", "name": "Ur tp", "units": "", "range": "0-135", "data": [
                            { "date": "10/24/2011", "value": "2" }, { "date": "8/22/2010", "value": "3" }
                        ]
                    },{
                        "loinc": "14959-1", "name": "ualb/cre", "units": "", "range": "< 30.0", "data": [
                            { "date": "10/24/2011", "value": "2" }, { "date": "8/22/2010", "value": "3" }
                        ]
                    },{
                        "loinc": "3094-0", "name": "BUN", "units": "mg/dL", "range": "8%-25%", "data": [
                            { "date": "10/24/2011", "value": "15" }, { "date": "01/05/2011", "value": "11" }
                        ]
                    },{
                        "loinc": "2160-0", "name": "Cre", "units": "mg/dL", "range": "0.6-1.5", "data": [
                            { "date": "10/24/2011", "value": "0.84" }, { "date": "01/05/2011", "value": "0.8" }
                        ]
                    },{
                        "loinc": "1920-8", "name": "SGOT", "units": "U/L", "range": "10-40", "data": [
                            { "date": "10/24/2011", "value": "27" }, { "date": "01/05/2011", "value": "33" }
                        ]
                    },{
                        "loinc": "2093-3", "name": "Chol", "units": "", "range": "< 200", "data": [
                            { "date": "10/24/2011", "value": "44" }, { "date": "8/22/2010", "value": "54" }
                        ]
                    },{
                        "loinc": "2571-8", "name": "Tri", "units": "mg/dL", "range": "< 150", "data": [
                            { "date": "10/24/2011", "value": "232"}, { "date": "03/16/2011", "value": "100" }
                        ]
                    },{
                        "loinc": "2085-9", "name": "HDL", "units": "mg/dL", "range": "> 40", "data": [
                            { "date": "10/24/2011", "value": "33"}, { "date": "03/16/2011", "value": "32" }
                        ]
                    },{
                        "loinc": "13457-7", "name": "LDL", "units": "mg/dL", "range": "< 100", "data": [

                            { "date": "10/24/2009", "value": "69" },
                            { "date": "03/16/2011", "value": "72" },
                            { "date": "12/16/2010", "value": "55" }
                        ]
                    },{
                        "loinc": "2345-7", "name": "Glu", "units": "mg/dL", "range": "70-110", "data": [
                            { "date": "10/24/2011", "value": "256" },
                                 
                            { "date": "1/05/2011", "value": "148" },
                        ]
                    },{
                        "loinc": "4548-4", "name": "A1C", "units": "%", "range": "< 7%", "data": [
                            { "date": "02/14/2012", "value": "8.6" },
                            { "date": "10/24/2011", "value": "10.4" }
                        ]
                    }
                ]

            };
            _.each(this.patient.labs, function (l) {
                _.each(l.data, function (r) {
                    var d = new XDate(r.date);
                    r.shortdate = d.toString('MM/dd/yy');
                });
            });
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
            };

            this.patient.ldl_flot_opts = {};
            $.extend(true, this.patient.ldl_flot_opts, _flot_opts, {
                yaxis: { min: 0, max: 200, ticks: [0, 50, 100, 150, 200], tickLength: 0 },
                grid: { markings: [{ yaxis: { from: 200, to: 100 }, color: "#eee" }] }
            });
            this.patient.a1c_flot_opts = {};
            $.extend(true, this.patient.a1c_flot_opts, _flot_opts, {
                yaxis: { min: 0, max: 20, ticks: [0, 5, 10, 15, 20], tickLength: 0 },
                grid: { markings: [{ yaxis: { from: 7, to: 20 }, color: "#eee" }] }
            });
            this.patient.bp_flot_opts = {};
            $.extend(true, this.patient.bp_flot_opts, _flot_opts, {
                yaxis: { min: 50, max: 200, ticks: [50, 100, 150, 200], tickLength: 0 },
                grid: {
                    markings: [
                        { yaxis: { from: 0, to: 80 }, color: "#eee" },
                        { yaxis: { from: 200, to: 130 }, color: "#eee" }
                    ]
                }
            });
        }

    }
});
