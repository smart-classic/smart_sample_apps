'use strict';

/* Application View Models
This is where most of the application logic resides. Here we combine data (from the model) with app-specific properties and functions for data binding, ui rendering, etc.
Note that we also have a dependency on the semantic services, as these modify, enhance, or organize data from the underlying model.
Depends on Mod
*/

var DMViewModels = angular.module('DM.ViewModels', ['DM.SemanticServices', 'DM.PatientServices', 'DM.Graph']);

DMViewModels.factory('$dmViewModels', function ($dmSemantics, $dmPatient, $dmGraph) {
    return {
        DiseaseViewModel: function() {
            this.diseases = [{ "diseaseName": "Diabetes", "CID": "44054006" }, { "diseaseName": "Hypothyroidism", "CID": "40930008" }, { "diseaseName": "Anemia", "CID": "271737000" }, { "diseaseName": "Asthma", "CID": "195967001" }, { "diseaseName": "New...", "CID": "" }];

            this.disease = this.diseases[0];
            this.disableddisease = this.diseases[4];

            this.patientHasDiseaseFrom = function () {
                var problems = $dmPatient.patient.problems;
                var problem = _.where(problems, {CID: this.disease.CID});
                if (problem.length > 0) {
                    this.show = true;
                    var now = new XDate();
                    var then = new XDate(problem[0].startDate);
                    var yrs = then.diffYears(now);
                    return Math.floor(yrs);
                }

                else {
                    this.show = false
                    return "";
                }
            }
        },
        ProblemViewModel: function () {
            this.problems = $dmPatient.patient.problems;

            this.sort = 'alpha';

            this.categories = [{label:"Normal", filter:"Normal", show:true, ordinal:2}, {label:"CoMorbidity",filter: 'CoMorbidity',show:true, ordinal:1}, {label:"Resolved",show:true, ordinal:0}];

            this.categories.sortByOrdinal();

            this.checkedOptions = function () {
                var sum = 0;
                _.each(this.categories, function (item) {
                    if (item.show)
                        sum += 1;
                });
                return (sum + '/' + this.categories.length);
            };

            this.hasFilteredProblems = function (filter) {
                var filtered = _.where(this.problems, { category: filter });
                return filtered.length == 0;
            };

            this.setSelected = function (problem, enabled) {
                if (enabled) {
                    _.each(this.problems, function (p) {
                        if (p.CID != problem.CID)
                            p.selected = false;
                    });
                    problem.selected = !problem.selected;
                }
            };

            this.setStatus = function (problem, status, mode) {
                if (status == "clear") {
                    problem.status = "";
                    problem.isDirty = false;
                    problem.note = "";
                    problem.mode = "";
                }
                else {
                    problem.status = status;
                    problem.isDirty = true;
                    problem.mode = mode;
                }
                problem.selected = false;
            };

            this.setSort = function () {
                if (this.sort == 'alpha') {
                    this.sortAlpha();
                }
                if (this.sort == 'chrono') {
                    this.sortChrono();
                }
            };
            this.sortAlpha = function () {
                this.problems = _(this.problems).sortBy(function (problem) {
                    return String.fromCharCode((problem.name.toLowerCase().charCodeAt(0)));
                });
            };
            this.sortChrono = function () {
                this.problems = _(this.problems).sortBy(function (problem) {
                    var d = new XDate(problem.startDate);

                    return -d.valueOf();
                });
            };

            this.cartUnselect = function () {
                _.each(this.problems, function (p) {
                    p.selected = false;
                });
            };

            this.getCartItems = function () {
                return _.where(this.problems, { "isDirty": true });
            };
        },
        MedicineViewModel: function () {
            this.medicines = $dmPatient.patient.medicines;

            this.medNames = false;
            
            this.sort = 'alpha';

            this.setMedNames = function () {
                var self = this;
                if (this.medNames) {
                    $dmSemantics.MedicineRxTerms(_.pluck(this.medicines, 'rxCui')).then(function (data) {
                        self.medicines.forEach(function (med, i) {
                            var rxterm = _.where(data, { RxCui: med.rxCui });
                            if (rxterm) {
                                med.rxNameOrig = med.rxName;
                                med.rxName = rxterm[0].DisplayNameSynonym;
                                med.strengthAndDoseFormOrig = med.strengthAndDoseForm;
                                med.strengthAndDoseForm = rxterm[0].StrengthAndDoseForm;
                                med.SYOrig = med.SY;
                                med.SY = rxterm[0].DisplayNameSynonym;
                            }
                        });
                        self.setSort();
                    });
                }
                else {
                    this.medicines.forEach(function (med, i) {
                        med.rxName = med.rxNameOrig;
                        med.strengthAndDoseForm = med.strengthAndDoseFormOrig;
                        med.SY = med.SYOrig;
                    });
                    this.setSort();
                }
            };
            this.setSort = function () {
                if (this.sort == 'alpha') {
                    this.sortAlpha();
                }
                if (this.sort == 'chrono') {
                    this.sortChrono();
                }
            };
            this.sortAlpha = function () {
                this.medicines = _(this.medicines).sortBy(function (med) {
                    return String.fromCharCode((med.rxName.toLowerCase().charCodeAt(0)));
                });
            };
            this.sortChrono = function () {
                this.medicines = _(this.medicines).sortBy(function (med) {
                    var d = new XDate(med.startDate);

                    return -d.valueOf();
                });
            };
            this.setSelected = function (med, enabled) {
                if (enabled) {
                    _.each(this.medicines, function (m) {
                        if (m.rxCui != med.rxCui)
                            m.selected = false;
                    });
                    med.selected = !med.selected;
                }
            };

            this.setStatus = function (med, status, mode) {
                if (status == "clear") {
                    med.status = "";
                    med.isDirty = false;
                    med.note = "";
                    med.mode = "";
                }
                else {
                    med.status = status;
                    med.mode = mode;
                    med.isDirty = true;
                }
                med.selected = false;
            };

            this.checkStatus = function (med, status) {
                return med.status == status;
            };

            this.cartUnselect = function () {
                _.each(this.medicines, function (m) {
                    m.selected = false;
                });
            };
            
            this.getCartItems = function () {
                return _.where(this.medicines, {"isDirty": true});
            }
        },
        VitalsViewModel: function() {
            this.vitals = $dmPatient.patient.vitals;

            _(this.vitals).each(function (vital) {
                vital.show = true;
                vital.data = _(vital.data).sortBy(function (r) {
                    return -(new XDate(r.date)).valueOf();
                });
            });

            this.checkedOptions = function () {
                var sum = 0;
                _.each(this.vitals, function (item) {
                    if (item.show)
                        sum += 1;
                });
                return (sum + '/' + this.vitals.length);
            };
        },
       
        LabResultsViewModel: function () {
            this.showDecisionSupport = false;
           
            this.checkedOptions = function () {
                if (this.labPanels) {
                    var total = this.labPanels.length;
                    var sum = 0;
                    _.each(this.labPanels, function (panel) {
                        if (panel.show)
                            sum += 1;
                    });
                    return sum + '/' + total;
                }
            };

            // Organize labs into panels and filter panels by disease using semantic services. Service also returns normal ranges by patient sex/age.
            this.setLabs = function (disease) {
                var self = this;
                var patientDemographics = {
                    medicalRecordNumber: $dmPatient.patient.medicalRecordNumber,
                    givenName: $dmPatient.patient.givenName,
                    familyName: $dmPatient.patient.familyName,
                    bday: $dmPatient.patient.bday,
                    age: $dmPatient.patient.age,
                    gender: $dmPatient.patient.gender
                };
                $dmSemantics.LabPanels(patientDemographics, disease).then(function (labPanels) {
                    labPanels = _.filter(labPanels, function (panel) {
                        return panel.tests.length > 0;
                    });

                    _(labPanels).each(function (panel) {
                        panel.show = !panel.hidePanel && panel.tests.length > 0;
                        panel.ordinal = panel.panelOrder;
                        _(panel.tests).each(function (test) {
                            var loinc = test.loinc;
                            test.range = test.testMin + '-' + test.testMax;// + ' ' + test.units;
                   
                            var data = _.where($dmPatient.patient.labs, { 'loinc': loinc });
                            
                            if (data.length >= 1) {
                                test.patient_lab = data[0];
                               
                                test.hasData = true;
                                var testdata = _.sortBy(data[0].data, function (t) {
                                    var d = new XDate(t.date);
                                    t.order = d.getTime();
                                    return -t.order;
                                });
                                test.data = testdata;
                                _.each(test.data, function (data) {
                                    data.flag = false;
                                    if (Number(data.value) != NaN && Number(test.testMin) != NaN && Number(test.testMax) != NaN) {
                                        if (Number(data.value) < Number(test.testMin) || Number(data.value) > Number(test.testMax)) {
                                            data.flag = true;
                                        }
                                    }
                                });
                            }
                            else {
                                test.hasData = false;
                                test.data = [{'value':'-'}, {'value':'-'}]
                            }
                        });
                    });
           
                    self.labPanels = labPanels;
                   
                    // Semantic service returns DS by analysis of lab data
                    $dmSemantics.DecisionSupport(labPanels).then(function (thedata) {
                        self.reminders = thedata;
                    });
                });
            };

            this.setStatus = function (test, status, mode) {
                var lab = test;
                if (status == "clear") {
                    lab.status = "";
                    lab.isDirty = false;
                    lab.note = "";
                    lab.mode = "";
                }
                else {
                    lab.status = status;
                    lab.isDirty = true;
                    lab.mode = mode;
                }
                test.selected = false;
            };

            this.setSelected = function (labresult, enabled) {
                if (enabled) {
                    _.each(this.tests, function (t) {
                        if (t.loinc != labresult.loinc)
                            t.selected = false;
                    });
                    labresult.selected = !labresult.selected;
                }
            };

            this.labPanels = [];
            this.tests = [];
            this.reminders = [];
        },
        OtherInfoViewModel: function() {
            this.otherinfo = $dmPatient.patient.otherinfo;
            
            _.each(this.otherinfo, function (item) {
                item.show = true;
            });

            this.checkedOptions = function () {
                var sum = 0;
                _.each(this.otherinfo, function (item) {
                    if (item.show)
                        sum += 1;
                });
                return (sum + '/' + this.otherinfo.length);
            };

            this.setOtherInfo = function () {
                //TODO
            }
        },
        AllergyViewModel: function() {
            this.allergies = $dmPatient.patient.allergies;

            this.checkedOptions = function () {
                var sum = 0;
                _.each(this.allergies, function (item) {
                    if (item.show)
                        sum += 1;
                });
                return (sum + '/' + this.allergies.length);
            };
        },
        PatientDemographicsViewModel: function () {
            this.init = function() {
                this.patientDemographics = {
                    medicalRecordNumber: $dmPatient.patient.medicalRecordNumber,
                    givenName: $dmPatient.patient.givenName,
                    familyName: $dmPatient.patient.familyName,
                    bday: $dmPatient.patient.bday,
                    age: $dmPatient.patient.age,
                    gender: $dmPatient.patient.gender
                };
                this.origPatientDemographcs = JSON.parse(JSON.stringify(this.patientDemographics));
            };

            this.deIdOptions = {
                options: [{ name: 'None', value: '' }, { name: 'Redact all', value: 'redact_all' }, { name: 'Publication', value: 'publication' }, { name: 'Aggregation', value: 'aggregation' }],
                selected: {name: 'None', value: ''}
            };
            
            this.setDeId = function () {
                if (this.deIdOptions.selected.value != '') {
                    this.deIdentify();
                }
                else {
                    this.deDeIdentify();
                }
            };

            this.deIdentify = function () {
                var self = this;
                return $.Deferred(function (dfd) {
                    if (self.deIdOptions.selected.value != '') {
                        self.showPatient = 'invisible';
                        self.deDeIdentify();
                        $dmSemantics.DeIdentify(self.patientDemographics, self.deIdOptions.selected.value).then(function (data) {
                            for (var prop in data) {
                                if (typeof (data[prop]) === "string")
                                    self.patientDemographics[prop] = data[prop];
                            }
                            self.showPatient = 'visible';
                            dfd.resolve();
                        });
                    }
                    else
                        dfd.resolve();
                }).promise();
            };
            this.deDeIdentify = function () {
                for (var prop in this.origPatientDemographcs) {
                    if (typeof (this.origPatientDemographcs[prop]) === "string")
                        this.patientDemographics[prop] = this.origPatientDemographcs[prop];
                }
            };
        },
        ProblemMedSemanticViewModel: function () {
            var self = this;

            var medicines = $dmPatient.patient.medicines;
            var problems = $dmPatient.patient.problems;
            var medicineproblems;

            this.init = function() {
                medicines = $dmPatient.patient.medicines;
                problems = $dmPatient.patient.problems;
            }

            this.probMedSemantics = false;
            this.colorPerc = 0;
            this.beginColor = new RGBColor('#E46C0A');
            this.endColor = new RGBColor('#202ef3');
            this.dimAlpha = 0.5;

            this.getDimStyle = function () {
                return { 'border': 'solid 1px #cccccc', 'height': '14px', 'width': '30px', 'background-color': getDimRGB() }
            };
           
            this.getBgColorStyle = function () {
                return {
                    'border': 'solid 1px #cccccc', 'height': '14px', 'width': '30px', 'background-color': getRGB()
                };
            };

            var getDim = function () {
                return { opacity: self.dimAlpha };
            };

            var getDimRGB = function () {
                return 'rgb(' + gradedValue(255, 0, self.dimAlpha) + ',' + gradedValue(255, 0, self.dimAlpha) + ',' + gradedValue(255, 0, self.dimAlpha) + ')';
            };

            var getRGB = function () {
                return 'rgb(' + gradedValue(self.beginColor.r, self.endColor.r, self.colorPerc) + ',' + gradedValue(self.beginColor.g, self.endColor.g, self.colorPerc) + ',' + gradedValue(self.beginColor.b, self.endColor.b, self.colorPerc) + ')';
            };
    
            var gradedValue = function (start, end, percent) {
                return start + Math.floor((percent * (end - start)));
            };

            // Event handlers - hooked to medicine and problem sections
            this.mouseAction = {
                options: [{ name: "Hover", value: "Hover" }, { name: "Click", value: "Click" }],
                selected: { name: "Hover", value: "Hover" }

            };

            this.semanticHighlight = {
                options: [{ name: "Both", value: "Both" }, {name:"Highlight",value:"Highlight"}, {name:"Dim", value:"Dim"}],
                selected: { name: "Both", value: "Both" }
            };

            this.medMouseDown = function (med) {
                if (this.mouseAction.selected.value == "Click" && this.probMedSemantics)
                    findProblems(med, this);
            };

            this.medMouseUp = function (med) {
                if (this.mouseAction.selected.value == "Click" && this.probMedSemantics)
                    unhighlight();
            };

            this.medMouseOver = function (med) {
                if (this.mouseAction.selected.value == "Hover" && this.probMedSemantics)
                    findProblems(med, this);
            };
            this.medMouseLeave = function (med) {
                if (this.mouseAction.selected.value == "Hover" && this.probMedSemantics)
                    unhighlight();
            };
            this.problemMouseDown = function (problem) {
                if (this.mouseAction.selected.value == "Click" && this.probMedSemantics)
                    findMeds(problem, this);
            };
            this.problemMouseUp = function (problem) {
                if (this.mouseAction.selected.value == "Click" && this.probMedSemantics)
                    unhighlight();
            };
            this.problemMouseOver = function (problem) {
                if (this.mouseAction.selected.value == "Hover" && this.probMedSemantics)
                    findMeds(problem, this);
            };
            this.problemMouseLeave = function (problem) {
                if (this.mouseAction.selected.value == "Hover" && this.probMedSemantics)
                    unhighlight();
            };

            this.getMedicineProblems = function () {
                medicineproblems = [];
                $dmSemantics.MedicineProblems(_.pluck(medicines, 'rxCui')).then(function (data) {
                    data.forEach(function (item, i) {
                        addMedProblem(item.RxCui, item.CID);
                    });
                });
            };

            this.removeMedicineProblems = function () {
                medicineproblems = [];
            };

            var addMedProblem = function (rxCui, CID) {
                var med = _.find(medicines, function (med) {
                    return med.rxCui == rxCui
                });
                var problem = _.find(problems, function (problem) {
                    return problem.CID == CID
                });
                if (med && problem)
                    medicineproblems.push({ 'medicine': med, 'problem': problem });
            };
            
            var findMeds = function (problem) {
                _.each(problems, function (p) {
                    p.style = (self.semanticHighlight.selected.value == 'Dim' || self.semanticHighlight.selected.value == 'Both') ? getDim() : {};
                });
                problem.style = { 'color': getRGB(), 'cursor': 'pointer' };
                _.each(medicines, function (m) {
                    m.style = (self.semanticHighlight.selected.value == 'Dim' || self.semanticHighlight.selected.value == 'Both') ? getDim() : {};
                });
                _.each(medicineproblems, function (mp) {
                    if (mp.problem.CID == problem.CID) {
                        mp.medicine.style = (self.semanticHighlight.selected.value == 'Highlight' || self.semanticHighlight.selected.value == 'Both') ? { 'color': getRGB(), 'cursor': 'pointer' } : {};
                    }
                });
            };
            var findProblems = function (med) {
                _.each(medicines, function (m) {
                    m.style = (self.semanticHighlight.selected.value == 'Dim' || self.semanticHighlight.selected.value == 'Both') ? getDim() : {};
                });
                med.style = { 'color': getRGB(), 'cursor': 'pointer' };
                _.each(problems, function (p) {
                    p.style = (self.semanticHighlight.selected.value == 'Dim' || self.semanticHighlight.selected.value == 'Both') ? getDim() : {};
                });
                _.each(medicineproblems, function (mp) {
                    if (mp.medicine.rxCui == med.rxCui) {
                        mp.problem.style = (self.semanticHighlight.selected.value == 'Highlight' || self.semanticHighlight.selected.value == 'Both') ? { 'color': getRGB() } : {};
                    }
                });
            };
            var unhighlight = function () {
                _.each(medicines, function (med) {
                    med.style = {};
                });
                _.each(problems, function (problem) {
                    problem.style = {};
                });
            };
        },
        CartViewModel: function () {
            this.cartModes = ["normal", "hypothetical"];
            this.cartMode = "normal";

            this.setMode = function () {
                if (this.cartMode == "normal")
                    this.cartMode = "hypothetical";
                else
                    this.cartMode = "normal";

                return this.cartMode;
            };

            this.buttonLabel = function () {
                if (this.cartMode == "normal")
                    return "Switch to hypothetical";
                else
                    return "Switch to normal";

                return this.cartMode;
            }

            this.getCartNum = function (mode) {
                var count = 0;
                _.each($dmPatient.patient.problems, function (problem) {
                    if (problem.isDirty && (problem.mode == mode || mode == undefined))
                        count++;
                });
                _.each($dmPatient.patient.medicines, function (med) {
                    if (med.isDirty && (med.mode == mode || mode == undefined))
                        count++;
                });
                _.each($dmPatient.patient.labs, function (lab) {
                    if (lab.isDirty && (lab.mode == mode || mode == undefined))
                        count++;
                });
                return count;
            };

            this.getCartDisabled = function () {
                if (this.getCartNum() > 0) {
                    return true;
                }
                return false;
            };
        },
        GraphViewModel: function () {
            var graphs = new $dmGraph();
            this.graphs = [
                { title: 'A1C', data: [graphs.a1c_arr], options: graphs.patientModel.a1c_flot_opts, label: 'goal < 17%', show: true, ordinal: 1 },
                { title: 'LDL', data: [graphs.ldl_arr], options: graphs.patientModel.ldl_flot_opts, label: 'goal < 100 mg/dL', show: true, ordinal: 2 },
                { title: 'BP', data: [graphs.bpsys_arr, graphs.bpdia_arr], options: graphs.patientModel.ldl_flot_opts, label: 'goal < 130/80 mm/hg', show: true, ordinal: 3 }
                
            ];

          
            this.graphs.sortByOrdinal();

            this.checkedOptions = function () {
                var sum = 0;
                _.each(this.graphs, function (item) {
                    if (item.show)
                        sum += 1;
                });
                return (sum + '/' + this.graphs.length);
            };
        },
        LayoutViewModel: function () {
            this.sections = [
                { secName: "Meds", id: 1, template: "medicine_section.html", column: 2, order: 1, hide: false },
                { secName: "Problems", id: 2, template: "problem_section.html", column: 1, order: 1, hide: false },
                 { secName: "Allergies", id: 3, template: "allergy_section.html", column: 2, order: 3, hide: false },
                 { secName: "Tests", id: 4, template: "labresults_section.html", column: 3, order: 2, hide: false },
                  { secName: "Exams", id: 5, template: "exams_section.html", column: 3, order: 3, hide: false },
                   { secName: "DecisionSuport", id: 6, template: "decisionsupport_section.html", column: 3, order: 3, hide: false },
                     { secName: "Vitals", id: 7, template: "vitals_section.html", column: 2, order: 2, hide: false },

                { secName: "Immunizations", id: 8, template: "immunizations_section.html", column: 3, order: 3, hide: false },

                { secName: "OtherInfo", id: 9,  template: "otherinfo_section.html", column: 1, order: 2, hide: false },
                
              
                { secName: "Graphs", id: 10, template: "graphs_section.html", column: 3, order: 1, hide: false },
                
               
               
            ];

         
            var self = this;
           
   
            this.columns = {
                column1: [],
                column2: [],
                column3: []
            }

            $dmSemantics.OrderSets().then(function (sets) {
                _.each(self.sections, function (section) {
                    var set = _.where(sets, { secId: section.id })[0];
                    if (set) {
                        $.extend(section, set);
                    }
                    if (section.column == 1) self.columns.column1.push(section);
                    if (section.column == 2) self.columns.column2.push(section);
                    if (section.column == 3) self.columns.column3.push(section);
                });

                self.columns.column1.sortByOrder();
                self.columns.column2.sortByOrder();
                self.columns.column3.sortByOrder();
                
            });

            this.saveOrderSets = function () {
                $dmSemantics.OrderSetsSave(this.columns);
                
            }
        }
    }
});