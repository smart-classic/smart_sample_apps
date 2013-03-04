// Patient data processing library
//
// Author: Nikolai Schwertner
//
// Revision history:
//     2011-12-29 Moved the patient information tab outside the tabs context
//     2011-06-21 Refactored
//     2011-06-06 Misc improvements; Refactored
//     2011-05-19 Misc code improvements; Inline documentation
//     2011-05-18 Initial split from main code
//
//    TO DO:
//       [ ] improve height interpolation algorithm

// Initialize the BPC global obeject as needed
var BPC;
if (!BPC) {
    BPC = {};
}

(function () {
    "use strict";
    
    // Shared patient object
    BPC.patient = {};

    /**
    * Registers a callback for obtaining the demographics data from SMART (asynchronous)
    *
    * @returns {Object} jQuery deferred promise object
    */  
    BPC.get_demographics = function() {
        var dfd = $.Deferred();
        SMART.get_demographics()
             .success(function(demos) {
                // Query the RDF for the demographics
                var demographics = demos.graph
                            .prefix('rdf', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#')
                            .prefix('foaf', 'http://xmlns.com/foaf/0.1/')
                            .prefix('v', 'http://www.w3.org/2006/vcard/ns#')
                            .where('?a v:n ?n')
                            .where('?n rdf:type v:Name')
                            .where('?n v:given-name ?firstname')
                            .where('?n v:family-name ?lastname')
                            .where('?a foaf:gender ?gender')
                            .where('?a v:bday ?birthday')
                            .get(0);
                            
                dfd.resolve({name: demographics.firstname.value.toString() + " " + demographics.lastname.value.toString(),
                             gender: demographics.gender.value.toString(),
                             birthday: demographics.birthday.value.toString()});
            })
            .error(function(e) {
                dfd.reject(e.message);
            });
        return dfd.promise();
    };

    /**
    * Registers a callback for obtaining the vitals data from SMART (asynchronous)
    *
    * @returns {Object} jQuery deferred promise object
    */  
    BPC.get_vitals = function(offset, vitals) {
        
        var dfd = $.Deferred(),
            response,
            filters,
            d, y;
            
        if (!vitals) {
            // Template for the vitals object thrown by the callback
            vitals = {heightData: [],
                      bpData: []};
        }
        
        if (BPC.settings.loading_mode === "progressive") {
            if (offset === 0) $('#title').text("loading 0%");
            filters = {limit:BPC.settings.vitals_limit, offset:offset};
        } else if (BPC.settings.loading_mode === "manual") {
            $('#loaded_through').show();
            $('#div_y').show();
            d = new Date();
            y = d.getFullYear();
            y -= offset;
            $('#loaded_through').text("Data stream starting from " + y);
            BPC.offset = offset;
            filters = {date_from:(y+"-01-01"), date_to:(y+"-12-31")};
        } else {   // full mode
            filters = {};
        }
        
        SMART.get_vital_sign_sets(filters)
             .success(function(vital_signs){
        
                // Query the RDF for the height data
                vital_signs.graph
                    .prefix('dcterms','http://purl.org/dc/terms/')
                    .prefix('sp','http://smartplatforms.org/terms#')
                    .where('?v dcterms:date ?vital_date')
                    .where('?v sp:height ?h')
                    .where('?h sp:value ?height')
                    .where('?h sp:unit \"cm\"')
                    .each(function(){
                        vitals.heightData.push({
                            vital_date: this.vital_date.value,
                            height: this.height.value
                        });
                    });            
                    
                // Query the RDF for the blood pressure data
                vital_signs.graph
                    .prefix('dcterms','http://purl.org/dc/terms/')
                    .prefix('sp','http://smartplatforms.org/terms#')
                    .where('?v dcterms:date ?vital_date')
                    .where('?v sp:bloodPressure ?bloodPressure')
                    .where('?bloodPressure sp:systolic ?s')
                    .where('?s sp:value ?systolic')
                    .where('?s sp:unit \"mm[Hg]\"')
                    .where('?bloodPressure sp:diastolic ?d')
                    .where('?d sp:value ?diastolic')
                    .where('?d sp:unit \"mm[Hg]\"')
                    .optional('?v sp:encounter ?encounter')
                    .optional('?bloodPressure sp:bodyPosition ?bodyPosition')
                    .optional('?bloodPressure sp:bodySite ?bodySite')
                    .optional('?bloodPressure sp:method ?method')
                    .each(function(){
                    
                        var res;
                    
                        if (this.encounter)  {
                            res = vital_signs.graph.where(this.encounter.toString() +  ' sp:encounterType ?encounterType').where('?encounterType sp:code ?code');
                            if (res.length === 1) {
                                this.code = res[0].code;
                            }
                        }
                        
                        if (this.bodyPosition)  {
                            res = vital_signs.graph.where(this.bodyPosition.toString() +  ' sp:code ?bodyPositionCode');
                            if (res.length === 1) {
                                this.bodyPositionCode = res[0].bodyPositionCode;
                            }
                        }
                        
                        if (this.bodySite)  {
                            res = vital_signs.graph.where(this.bodySite.toString() +  ' sp:code ?bodySiteCode');
                            if (res.length === 1) {
                                this.bodySiteCode = res[0].bodySiteCode;
                            }
                        }
                        
                        if (this.method)  {
                            res = vital_signs.graph.where(this.method.toString() +  ' sp:code ?methodCode');
                            if (res.length === 1) {
                                this.methodCode = res[0].methodCode;
                            }
                        }
                    
                        vitals.bpData.push({
                            vital_date: this.vital_date.value.toString(),
                            systolic: this.systolic.value.toString(),
                            diastolic: this.diastolic.value.toString(),
                            bodyPositionCode: this.bodyPositionCode && this.bodyPositionCode.value.toString(),
                            bodySiteCode: this.bodySiteCode && this.bodySiteCode.value.toString(),
                            methodCode: this.methodCode && this.methodCode.value.toString(),
                            encounterTypeCode: this.code && this.code.value.toString()});
                    });
                    
                // If this is the first page, grab the total number of results
                if (offset === 0) {
                    response = vital_signs.graph
                        .prefix('rdf','http://www.w3.org/1999/02/22-rdf-syntax-ns#')
                        .prefix('api','http://smartplatforms.org/terms/api#')
                        .where('?rs rdf:type api:ResponseSummary')
                        .where('?rs api:resultsReturned ?results')
                        .where('?rs api:totalResultCount ?total')
                        .get(0);

                    try {
                        vitals.total = Number(response.total.value.toString());
                    } catch(err) {
                        vitals.total = 0
                    }
                }
                    
                dfd.resolve(vitals);
            })
            .error(function(e) {
                dfd.reject(e.message);
            });
        return dfd.promise();
    };
    
    BPC.loadAdditionalVitals = function (demographics, vitals, offset, total) {
        $('#title').text("loading " + Math.round((offset / total) * 100) + "%");
        $.when(BPC.get_vitals(offset, vitals))
         .then( function (vitals) {
                    var patient = BPC.processData(demographics, vitals);
                    BPC.initPatient (patient);
                    BPC.patient = patient;
                    BPC.redrawViewShort (BPC.patient,BPC.settings.zones);
                    BPC.setDateRange(0,100);
                    BPC.redrawViewLong (BPC.patient,BPC.settings.zones);
                    BPC.redrawViewTable (BPC.patient);
                    var next_offset = offset + BPC.settings.vitals_limit;
                    if (next_offset < total) {
                        BPC.loadAdditionalVitals (demographics, vitals, next_offset, total);
                    } else {
                        $('#title').text(BPC.settings.app_title);
                    }
                },
                function (message) {
                    BPC.displayError (message.data);
                });
    };
    
    BPC.loadAnotherY = function () {
        $('#title').text("loading data...");
        $.when(BPC.get_vitals(BPC.offset+1, BPC.vitals))
         .then( function (vitals) {
                    var patient = BPC.processData(BPC.demographics, vitals);
                    BPC.initPatient (patient);
                    BPC.patient = patient;
                    BPC.redrawViewShort (BPC.patient,BPC.settings.zones);
                    BPC.setDateRange(0,100);
                    BPC.redrawViewLong (BPC.patient,BPC.settings.zones);
                    BPC.redrawViewTable (BPC.patient);
                    BPC.vitals = vitals;
                    $('#title').text(BPC.settings.app_title);
                },
                function (message) {
                    BPC.displayError (message.data);
                });
    };

    /**
    * Constructs a new patient object from the data provided
    *
    * @param {Object} demographics Array of objects. Parameters include:
    *                                   birthday as date, 
    *                                   gender ('male' or 'female')
    * @param {Object} vitals Array of objects. Parameters include:
    *                                   heightData as list of objects,
    *                                   bpData as list of objects
    *
    * @returns {Object} Patient object constructed from the data or null
    */  
    BPC.processData = function(demographics, vitals) {

        var s = BPC.getViewSettings (),
            vitals_height = vitals.heightData,
            vitals_bp = vitals.bpData,
            height_data = [],
            height_data_adult = [],
            patient,
            age,
            height,
            myHeight,
            getClosestHeight,
            i;

        // Initialize the patient information area
        patient = new BPC.Patient(demographics.name, demographics.birthday, demographics.gender);
        $("#patient-info").text(String(patient));
        
        if (vitals_bp.length === 0) {
            // Display appropriate error message when there are no vitals
            // and degrade to calculator-only mode
        
            //BPC.displayError("No vitals in the patient record");
            
            // Clear the error message
            $("#info").text("").hide();
        
            // Set the default tab to "calculator" and disable the first three tabs
            $('#tabs').tabs({
                selected: 3
            }).tabs('option','disabled', [0, 1, 2]);
            
            // Show the tabs
            $("#tabs").show();
            
            // Initialize the calculator
            BPC.initCalculator ({
               age: current_age(patient.birthdate), 
               sex: patient.sex, 
               height: 0, 
               systolic: 0, 
               diastolic: 0});
            
            // Display the error message
            $("#dialog-demo #alert-message").text("There are no usable vital signs in the patient record. You may want to try entering the current height and blood pressure measurements in the Pediatric Percentile Calculator manually.");
            $("#dialog-demo").dialog({
                closeOnEscape: false,
                draggable: false,
                resizable: false,
                modal: true,
                buttons: {
                    Ok: function() {
                        $( this ).dialog( "close" );
                    }
                }
            });
        } else {
            
            // No errors detected -> proceed with full data processing

            //height_data = [{date: demographics.birthday, height:50}]; //(Assume average height at birth of 50cm)

            // Copy the height data into the height data array converting the heights to centimeters
            for (i = 0; i < vitals_height.length; i++) {
                height_data.push({age: years_apart( vitals_height[i].vital_date, patient.birthdate ),
                                  date: vitals_height[i].vital_date,
                                  height: Math.round(vitals_height[i].height * 1.0)});
            }

            // Sort the height data array
            height_data.sort(function (a,b) {
                var x = parse_date(a.date).getTime(),
                    y = parse_date(b.date).getTime();
                
                return ( (x<y) ? -1: ((x>y)?1:0));
            });
            
            // Array of height data taken when an adult
            height_data_adult = [];
            
            // Don't use Array.filter or IE8 will have a problem
            for (i = 0; i < height_data.length; i++) {
                if (height_data[i].age >= BPC.settings.adult_age) {
                    height_data_adult.push (height_data[i]);
                }
            }
            
            // This fails in IE8 (apparently Array.filter is not implemented there)
            /*
            height_data_adult = height_data.filter(function (e) {
                return e.age >= BPC.settings.adult_age;
            });
            */

            // Inner function for looking up the closest height for a given date
            getClosestHeight = function (recordDate, height_data) { 
                
                var closestHeight,
                    closestHeightDate,
                    j;
                    
                if (height_data.length === 0) return;
                
                closestHeight = height_data[0].height;
                closestHeightDate = height_data[0].date;
                    
                for (j = 0; j < height_data.length; j++) {
                    if ( Math.abs(years_apart(height_data[j].date, recordDate)) < Math.abs(years_apart(closestHeightDate, recordDate)) ) {
                        closestHeight = height_data[j].height;
                        closestHeightDate = height_data[j].date;
                    }
                }
                
                return {date: closestHeightDate, value: closestHeight};
                    
            };
            
            // Add the blood pressure data records to the patient object
            for (i = 0; i < vitals_bp.length; i++) {  

                // Calculate the age of the patient at the ime of the vital encounter
                age = years_apart( vitals_bp[i].vital_date, patient.birthdate );
                
                if (age < BPC.settings.adult_age) {
                    // Add code to update the patient data records with extrapolated height
                    // ...
                    // ... For now, here is a *very* inefficient function which picks the closest height data point.
                    myHeight = getClosestHeight (vitals_bp[i].vital_date, height_data);

                    // Set the height to undefined when there is no height data within the staleness horizon
                    if (myHeight && years_apart(myHeight.date, vitals_bp[i].vital_date) <= BPC.getHeightStaleness (demographics.gender,age)) {
                        height = myHeight.value;
                    } else {
                        height = undefined;
                    }
                } else {                
                    // When the reading is for an adult, get the closest height from the adult readings
                    myHeight = getClosestHeight (vitals_bp[i].vital_date, height_data_adult);
                    if (myHeight) {
                        height = myHeight.value;
                    }
                    //height = undefined;
                }
                
                // Add the data point to the patient object
                patient.data.push ({timestamp: vitals_bp[i].vital_date, 
                    height: height,
                    systolic: Math.round(vitals_bp[i].systolic),
                    diastolic: Math.round(vitals_bp[i].diastolic), 
                    site: BPC.getTermLabel (vitals_bp[i].bodySiteCode),
                    position: BPC.getTermLabel (vitals_bp[i].bodyPositionCode),
                    method: BPC.getTermLabel (vitals_bp[i].methodCode),
                    encounter: BPC.getTermLabel (vitals_bp[i].encounterTypeCode)}
                );
            }

            return patient;
        }
    };
           
    /**
    * Sorts the patient data records and adds various utility methods to a patient object
    *
    * @param {Object} patient (in the same format as the sample patient in bpc-config.js)
    */
    BPC.initPatient = function (patient) {

        var s = BPC.getViewSettings (),
            percentiles,
            i, ii, d,
            res;

        // Load the sample patient when no data is provided
        if (!patient) {
            patient = BPC.getSamplePatient ();
        }
             
        // Sort the patient data records by timestamp
        patient.data.sort(function (a,b) {
        
            var x = parse_date(a.timestamp).getTime(),
                y = parse_date(b.timestamp).getTime();
                
            return ( (x<y) ? -1: ((x>y)?1:0));
        });
             
        // Calculate the age and percentiles for the patient encounters
        for (i = 0, ii = patient.data.length; i < ii; i++) {
        
            // Calculate the patient's age at the time of the reading
            patient.data[i].age = years_apart( patient.data[i].timestamp , patient.birthdate );

            // Calculate the blood pressure percentiles according to the age rules
            if ( (patient.data[i].age >= 1 && patient.data[i].age < BPC.settings.adult_age) && patient.data[i].height ) {
                // For pediatric patients (1-18 year old) with height data
                percentiles = bp_percentiles ({height: patient.data[i].height / 100,   // convert height to meters from centimeters
                                               age: patient.data[i].age, 
                                               sex: patient.sex, 
                                               systolic: patient.data[i].systolic, 
                                               diastolic: patient.data[i].diastolic,
                                               round_results: true});
                patient.data[i].sPercentile = percentiles.systolic;
                patient.data[i].dPercentile = percentiles.diastolic;
            } else if (patient.data[i].age >= BPC.settings.adult_age) {
                // For adult patients
                patient.data[i].sPercentile = BPC.getAdultPercentile(patient.data[i].systolic,true);
                patient.data[i].dPercentile = BPC.getAdultPercentile(patient.data[i].diastolic,false);
            }
            
            // Set the abbreviation for the adult percentiles
            if (patient.data[i].age >= BPC.settings.adult_age) {
                res = getAbbreviationLabel (BPC.settings.zones, patient.data[i].sPercentile, patient.data[i].dPercentile);
                patient.data[i] = $.extend(patient.data[i], res);
                //patient.data[i].sAbbreviation = res.sAbbreviation;
                //patient.data[i].dAbbreviation = res.dAbbreviation;
                //patient.data[i].label = res.label;
            } else {
                if (patient.data[i].sPercentile || patient.data[i].dPercentile) {
                    patient.data[i].plabel = "";
                    if (patient.data[i].sPercentile) patient.data[i].plabel += patient.data[i].sPercentile + "%";
                    else patient.data[i].plabel += "x";
                    patient.data[i].plabel += "/";
                    if (patient.data[i].dPercentile) patient.data[i].plabel += patient.data[i].dPercentile + "%";
                    else patient.data[i].plabel += "x";
                } else {
                    patient.data[i].plabel = "-";
                }
            }
            
            // Convert the date into the output format and standard unix timestamp
            d = parse_date (patient.data[i].timestamp);
            patient.data[i].date = d.toString(s.dateFormat);
            patient.data[i].unixTime = d.getTime();
        }
            
        // Set the unix timestamps of the first and last encounters
        patient.startUnixTime = patient.data[0].unixTime;
        patient.endUnixTime = patient.data[patient.data.length - 1].unixTime;
    };

    /**
    * Constructor for a new patient object
    *
    * @param {String} name The name of the patient
    * @param {String} birthdate The date of birth of the patient
    * @param {String} sex ('male' or 'female')
    */
    BPC.Patient = function (name, birthdate, sex) {
        this.name = name;
        this.birthdate = birthdate;
        this.sex = sex;
        this.data = [];
    };

    /**
    * Returns the patient object label string
    */
    BPC.Patient.prototype.toString = function() {
    
        var s = BPC.getViewSettings(),
            d = parse_date (this.birthdate);
            
        return this.name + " (" + this.sex + ", DOB: " + d.toString(s.dateFormat) + ")";
    };

    /**
    * Spawns a clone of a patient
    *
    * @returns {Object} a clone of the patient object
    */
    BPC.Patient.prototype.clone = function() {
        // For shallow copying use "jQuery.extend({}, this);"
        return jQuery.extend(true, new BPC.Patient (), this);
    };

    /**
    * Returns a copy of the patient object containing the n most recent encounters data
    *
    * @param {Integer} n The number of encounters to return
    *
    * @returns {Object} a clone of the patient object
    */
    BPC.Patient.prototype.recentEncounters = function (n) {
        var p = this.clone(),
            newDate,
            dateCounter,
            lastDate,
            i;
            
        p.data = [];
        
        // only include the last three encounters (the last data point of a day)
        for (i = this.data.length - 1, dateCounter = 0, lastDate; i >= 0 && dateCounter < n; i--) {
        
            newDate = parse_date(this.data[i].date).toString("yyyy-MM-dd");
            
            if (!lastDate || newDate !== lastDate) {
                p.data.push (this.data[i]);
                lastDate = newDate;
                dateCounter++;
            }
        }
        
        // need to reverse the array to restore the canonical order
        p.data.reverse();
        
        return p;
    };
     
    /**
    * Applies a filter to the patient object and returns a new patient object
    *
    * @param {Function} filter The filter method to apply
    *
    * @returns {Object} the resultant patient
    */
    BPC.Patient.prototype.applyFilter = function (filter) {       
        var i,
            p = this.clone();
            
        p.data = [];
        
        // Run the filter
        for (i = 0; i < this.data.length; i++) {
            if (filter(this.data[i])) {
                p.data.push (this.data[i]);
            }
        }
        
        // Set the unix timestamps of the first and last encounters
        if (p.data.length > 0) {
            p.startUnixTime = p.data[0].unixTime;
            p.endUnixTime = p.data[p.data.length - 1].unixTime;
        }
        
        return p;
    };
    
    BPC.PEDIATRIC = 0;
    BPC.ADULT = 1;
    BPC.MIXED = 2;
    
    /**
    * Retruns the type of the patient based on the readings (PEDIATRIC, ADULT, or MIXED)
    *
    * @param {Function} filter The filter method to apply
    *
    * @returns {Object} the resultant patient
    */
    BPC.Patient.prototype.getDataType = function () {
        var data = this.data;
        
        // Default to pediatric when no data is available
        if (data.length === 0) return BPC.PEDIATRIC;
        
        if (data[0].age < BPC.settings.adult_age) {
            if (data[data.length - 1].age < BPC.settings.adult_age) return BPC.PEDIATRIC;
            else return BPC.MIXED;
        } else {
            return BPC.ADULT;
        }
    };

    /**
    * Extracts the years from the age
    *
    * @param {Number} the age of the patient in years
    *
    * @returns {Integer} the years in the patient's age
    */
    BPC.getYears = function (age) {
        return Math.floor(age);
    };

    /**
    * Extracts the months from the age
    *
    * @param {Number} the age of the patient in years
    *
    * @returns {Integer} the months in the patient's age
    */
    BPC.getMonths = function (age) {
        return Math.floor((age*12)%12);
    };
    
    /**
    * Returns the abbreviations and label corresponding to a patient's blood pressure percentiles
    *
    * @param {Object} zones The zones object
    * @param {Number} sPercentile The systolic blood pressure percentile
    * @param {Number} dPercentile The diastolic blood pressure percentile
    *
    * @returns {Object} The abbreviations and label for the percentile
    */
    var getAbbreviationLabel = function (zones, sPercentile, dPercentile) {
    
        var zoneStart,
            zoneEnd,
            i,
            s = BPC.getViewSettings(true,true),
            percentile,
            label,
            sAbbreviation,
            dAbbreviation,
            defaultResult = {sAbbreviation: s.abbreviationDefault, dAbbreviation: s.abbreviationDefault, label: s.labelDefault};
            
        if (sPercentile && dPercentile) {
            percentile = Math.max(sPercentile, dPercentile);
        }
        
        if (!percentile) return defaultResult;
            
        var findAbbreviationLabel = function (percentile) {
            for (i = 0, zoneStart = 0, zoneEnd = 0; i < zones.length; i++) {
                zoneEnd = zoneEnd + zones[i].percent;
                
                if (zoneStart <= percentile && percentile <= zoneEnd) {
                    return {abbreviation: zones[i].abbreviation, label: zones[i].label};
                }
                
                zoneStart = zoneEnd;
            }
            
            return {};
        }
        
        label = findAbbreviationLabel(percentile).label;
        sAbbreviation = findAbbreviationLabel(sPercentile).abbreviation;
        dAbbreviation = findAbbreviationLabel(dPercentile).abbreviation;
        
        if (label && sAbbreviation && dAbbreviation) {
            return {sAbbreviation: sAbbreviation, dAbbreviation: dAbbreviation, label: label, plabel: label};
        }
        
        return defaultResult;  // never returned unless the zones don't sum up to 100%
    };
}());
