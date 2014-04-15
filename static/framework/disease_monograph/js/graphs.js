'use strict';

/* Graph services
THIS IS ALL A HACK FOR NOW. 

This will become a directive in near release.

*/
var DMGraph = angular.module('DM.Graph', ['DM.PatientServices']);

DMGraph.factory('$dmGraph', function ($rootScope, $dmPatient) {
    return function() {
        this.patientModel = $dmPatient.patient;
        this.ldl_arr = [];
        this.a1c_arr = [];
        this.bpsys_arr = [];
        this.bpdia_arr = [];

        //this.graphData = function (loinc) {
        //    var labToGraph = patientModel.labs.filter(function (lab) {
        //        return lab.loinc == loinc;
        //    }) || null;

        //    var dataToGraph = [];

        //    if (labToGraph) {
        //        dataToGraph = _(labToGraph.data).chain()
        //        .map(function (r) {
        //            var d = new XDate(r.date);
        //            return [
        //                d.valueOf(),
        //                r.value
        //            ]
        //        })
        //        .sortBy(function (r) {
        //            return r[0];
        //        })
        //        .value()
        //    }
        //};

        var ldl = this.patientModel.labs.filter(function (lab) {
            return lab.loinc == "18262-6" || lab.loinc == "13457-7" || lab.loinc == "2089-1"
        })[0] || null;

        if (ldl) {
            this.ldl_arr = _(ldl.data).chain()
            .map(function (r) {
                var d = new XDate(r.date);
                return [
                    d.valueOf(),
                    r.value
                ]
            })
            .sortBy(function (r) {
                return r[0];
            })
            .value()
        }

        var a1c = this.patientModel.labs.filter(function (lab) {
            return lab.loinc == "4548-4" || lab.loinc == "17856-6"
        })[0] || null;

        if (a1c) {
            this.a1c_arr = _(a1c.data).chain()
            .map(function (r) {
                var d = new XDate(r.date);
                return [
                    d.valueOf(),
                    r.value
                ]
            })
            .sortBy(function (r) {
                return r[0];
            })
            .value()
        }

        var bpsys = this.patientModel.vitals.filter(function (vital) {
            return vital.name == "bloodPressure" && vital.subName == "systolic"
        })[0] || null;

        if (bpsys) {
            this.bpsys_arr = _(bpsys.data).chain()
            .map(function (r) {
                var d = new XDate(r.date);
                return [
                    d.valueOf(),
                    r.value
                ]
            })
            .sortBy(function (r) {
                return r[0];
            })
            .value()
        }
        var bpdia = this.patientModel.vitals.filter(function (vital) {
            return vital.name == "bloodPressure" && vital.subName == "diastolic"
        })[0] || null;

        if (bpdia) {
            this.bpdia_arr = _(bpdia.data).chain()
            .map(function (r) {
                var d = new XDate(r.date);
                return [
                    d.valueOf(),
                    r.value
                ]
            })
            .sortBy(function (r) {
                return r[0];
            })
            .value()
        }
        
        this.a1c_data = { data: [this.a1c_arr], options: this.patientModel.a1c_flot_opts, title: 'A1C', label: 'goal < 17%' };
        this.ldl_data = { data: [this.ldl_arr], options: this.patientModel.ldl_flot_opts,title: 'LDL', label: 'goal < 100 mg/dL' };
        this.bp_data = { data: [this.bpsys_arr, this.bpdia_arr], options: this.patientModel.ldl_flot_opts, title: 'BP', label: 'goal < 130/80 mm/hg' };
        
       
    }
});