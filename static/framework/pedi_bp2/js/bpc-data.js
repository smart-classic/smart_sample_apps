// Patient data processing library
//
// Author: Nikolai Schwertner
// Revision history:
//     2011-05-19 Misc code improvements; Inline documentation
//     2011-05-18 Initial split from main code
//
//    TO DO:
//       [ ] improve height interpolation algorithm

// Global patient data holder
var patient;

// Global zone data holder
var zone = getZoneData ();

/**
* Registers a callback for obtaining the demographics data from SMART (asynchronous)
*
* @returns {Object} jQuery deferred promise object
*/  
var get_demographics = function() {
    var dfd = $.Deferred();
    SMART.DEMOGRAPHICS_get(function(demos) {
    
        // Query the RDF for the demographics
        var demographics = demos.prefix('foaf', 'http://xmlns.com/foaf/0.1/')
                    .prefix('sp', 'http://smartplatforms.org/terms#')
                    //.where('?a foaf:givenName ?givenName')
                    //.where('?a foaf:familyName ?familyName')
                    .where('?a foaf:gender ?gender')
                    .where('?a sp:birthday ?birthday')
                    .get(0);
                    
        dfd.resolve({gender: demographics.gender.value,
                     birthday: demographics.birthday.value});
    });
    return dfd.promise();
};

/**
* Registers a callback for obtaining the vitals data from SMART (asynchronous)
*
* @returns {Object} jQuery deferred promise object
*/  
var get_vitals = function() {
    
    var dfd = $.Deferred();
    
    // Template for the vitals object thrown by the callback
    var vitals = {heightData: [],
                  bpData: []};
    
    SMART.VITAL_SIGNS_get(function(vital_signs){
    
        // Query the RDF for the height data
        vital_signs
            .where('?v dc:date ?vital_date')
            .where('?v sp:height ?h')
            .where('?h sp:value ?height')
            .where('?h sp:unit \"m\"')
            .each(function(){vitals.heightData.push({
                vital_date: this.vital_date.value,
                height: this.height.value
            })});
            
        // Query the RDF for the blood pressure data
        vital_signs
            .where('?v dc:date ?vital_date')
            .where('?v sp:encounter ?encounter')
            .where('?encounter sp:encounterType ?encounterType')
            .where('?encounterType sp:code ?code')
            .where('?v sp:bloodPressure ?bloodPressure')
            .where('?bloodPressure sp:systolic ?s')
            .where('?s sp:value ?systolic')
            .where('?s sp:unit \"mm[Hg]\"')
            .where('?bloodPressure sp:diastolic ?d')
            .where('?d sp:value ?diastolic')
            .where('?d sp:unit \"mm[Hg]\"')
            .where('?bloodPressure sp:bodyPosition ?bodyPosition')
            .where('?bodyPosition sp:code ?bodyPositionCode')
            .where('?bodyPosition dcterms:title ?bodyPositionTitle')
            .where('?bloodPressure sp:bodySite ?bodySite')
            .where('?bodySite sp:code ?bodySiteCode')
            .where('?bodySite dcterms:title ?bodySiteTitle')
            .each(function(){vitals.bpData.push({
                vital_date: this.vital_date.value,
                systolic: this.systolic.value,
                diastolic: this.diastolic.value,
                bodyPositionCode: this.bodyPositionCode.value,
                bodySiteCode: this.bodySiteCode.value,
                bodyPositionTitle: this.bodyPositionTitle.value,
                bodySiteTitle: this.bodySiteTitle.value,
                encounterTypeCode: this.code.value
            })});
            
        dfd.resolve(vitals);
    });
    return dfd.promise();
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
* @returns {Object} Patient object constructed from the data
*/  
var processData = function(demographics, vitals) {

    // Local aliases for the two vitals data lists
    var vitals_height = vitals.heightData,
        vitals_bp = vitals.bpData;

    // Caculate the current age of the patient
    var age = years_apart(new Date().toISOString(), demographics.birthday);

    // Display appropriate error message
    if (vitals_height.length == 0 || vitals_bp.lenght == 0) {
        $("#error").text("Error: No vitals in the patient record");
    } else if (age > 18) {
        $("#error").text("Error:  " + SMART.record.full_name + " is not a pediatric patient (age " + Math.floor(age) + ")");
    } else {
        // No errors detected -> proceed with full data processing

        // Clear the error message
        $("#error").text("").hide();

        // Initialize the height data array (Assume average height at birth of 50cm)
        var height_data = [{date: demographics.birthday, height:50}];

        // Copy the height data into the height data array converting the heights to centimeters
        for (var i = 0; i < vitals_height.length; i++) {
            height_data.push({date: vitals_height[i].vital_date,
                              height: Math.round(vitals_height[i].height * 100)});
        }

        // Sort the height data array
        height_data.sort(function (a,b) {
                  var x = a.date;
                  var y = b.date;
                  return ( (x<y) ? -1: ((x>y)?1:0));
        });

        // Initialize a new patient object with the proper demographics
        var patient = {
            name: SMART.record.full_name,
            birthdate: parse_date(demographics.birthday).toString('yyyy-MM-dd'),
            sex: demographics.gender,
            data: []
        };

        // Add the blood pressure data records to the patient object
        for (var i = 0; i < vitals_bp.length; i++) {  

            // Add code to update the patient data records with extrapolated height
            // ...
            // ... For now, here is a *very* inefficient function which picks the closest height data point.
            var myHeight = function (recordDate) {            
                var closestHeight = height_data[0].height;
                var closestHeightDate = height_data[0].date;
                for (var j = 0; j < height_data.length; j++) {
                    if ( Math.abs(years_apart(height_data[j].date, recordDate)) < Math.abs(years_apart(closestHeightDate, recordDate)) ) {
                        var closestHeight = height_data[j].height;
                        var closestHeightDate = height_data[j].date;
                    }
                }
                return closestHeight;
            } (vitals_bp[i].vital_date);

            // Add the data record to the patient object
            patient.data.push ({timestamp: vitals_bp[i].vital_date, 
                height: myHeight,
                systolic: Math.round(vitals_bp[i].systolic),
                diastolic: Math.round(vitals_bp[i].diastolic), 
                site: getTermLabel (vitals_bp[i].bodySiteCode),
                position: getTermLabel (vitals_bp[i].bodyPositionCode), 
                encounter: getTermLabel (vitals_bp[i].encounterTypeCode)}
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
var initPatient = function (patient) {

    // Load the sample patient when no data is provided
    if (!patient) patient = getSamplePatient ();

    // Sort the patient data records by timestamp
    patient.data.sort(function (a,b) {
        var x = a.timestamp;
        var y = b.timestamp;
        return ( (x<y) ? -1: ((x>y)?1:0));
    });
    
    // Method: Generates a patient label
    patient.toString = function() {
        return this.name + " (" + this.sex + ", DOB: " + this.birthdate + ")";
    };
    
    // Method: Spawns a clone of a patient
    patient.clone = function() {
        // For shallow copying use "jQuery.extend({}, this);"
        return jQuery.extend(true, {}, this);
    };
    
    // Method: Returns a patent with the n most recent encounters data
    patient.recentEncounters = function (n) {
        var p = this.clone();
        p.data = [];
        
        for (var i = this.data.length - 1, dateCounter = 0, lastDate; i >= 0 && dateCounter < n; i--) {
            p.data.push (this.data[i]);
            newDate = this.data[i].date;
            if (!lastDate || newDate != lastDate) {
                lastDate = newDate;
                dateCounter++;
            }
        }
        
        p.data.reverse();
        
        return p;
    }
    
    // Method: Applies a filter to the patient object and returns a new patient object
    patient.applyFilter = function (filter) {       
        var p = this.clone();
        p.data = [];
        
        for (var i = 0; i < this.data.length; i++) {
            if (filter(this.data[i])) p.data.push (this.data[i]);
        }
        
        // The unix timestamps of the first and last encounters
        if (p.data.length > 0) {
            p.startUnixTime = p.data[0].unixTime;
            p.endUnixTime = p.data[p.data.length - 1].unixTime;
        }
        
        return p;
    };
           
    // Calculate the age and percentiles for the patient encounters
    for (var i = 0, ii = patient.data.length; i < ii; i++) {
    
        // Calculate age and percentiles
        patient.data[i].age = Math.floor( years_apart( patient.data[i].timestamp , patient.birthdate ) );       
        var percentiles = bp_percentiles ({height: patient.data[i].height / 100,   // convert height to meters from centimeters
                                           age: patient.data[i].age, 
                                           sex: patient.sex, 
                                           systolic: patient.data[i].systolic, 
                                           diastolic: patient.data[i].diastolic});
        patient.data[i].sPercentile = percentiles.systolic;
        patient.data[i].dPercentile = percentiles.diastolic;
        
        // Convert the date into the output format and standard unix timestamp
        var d = parse_date (patient.data[i].timestamp);
        patient.data[i].date = d.toString('dd MMM yyyy');
        patient.data[i].unixTime = d.getTime();
    }
        
    // Set the unix timestamps of the first and last encounters
    patient.startUnixTime = patient.data[0].unixTime;
    patient.endUnixTime = patient.data[patient.data.length - 1].unixTime;
};