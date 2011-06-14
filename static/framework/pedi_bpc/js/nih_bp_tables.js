// Regression parameters from: http://www.cc.nih.gov/ccc/pedweb/pedsstaff/bp.html
//                             http://www.nhlbi.nih.gov/health/prof/heart/hbp/hbp_ped.pdf
// Retrieved 4/6/2011
// JS by:  Josh Mandel
// Revisions:
//      2011-06-02  Added BP Thresholds search method (NJS)
//
//    TO DO:
//       [ ] Validate the thresholds resolver algorithm


/**
* Find systolic and diastolic BP percentiles for patient
*
* @param {Object} p Parameters include:
*                      height in meters, 
*                      age in years, 
*                      sex ('male' or 'female'), 
*                      systolic in mmHg, 
*                      diastolic in mmHg
*
* @returns {Object} Parameters include:
                       systolic in percentile,
                       diastolic in percentile
*/
var bp_percentiles = (function() {

  var ret = function(patient) {
    var age = patient.age,
        height = patient.height,
        sex = patient.sex,
        sbp = patient.systolic,
        dbp = patient.diastolic;

    var zht = find_height_zscore(patient);
    
    var zsys = (sbp - calc_mu(age, zht, bpregression[sex].systolic)) / bpregression[sex].systolic.sigma;
    var zdias = (dbp - calc_mu(age, zht, bpregression[sex].diastolic)) / bpregression[sex].diastolic.sigma;

      
    var f = patient.round_results ? Math.round : function(x){return x;};
 
    return {
	systolic: f(Math.cdf(zsys)*100),
	diastolic: f(Math.cdf(zdias)*100)
    };
    
  };

  var calc_mu = function(y, zht, params) {
    return params.alpha + 
         params.beta1 * Math.pow(y-10, 1) + 
         params.beta2 * Math.pow(y-10, 2) + 
         params.beta3 * Math.pow(y-10, 3) + 
         params.beta4 * Math.pow(y-10, 4) + 
         params.gamma1 * Math.pow(zht, 1) + 
         params.gamma2 * Math.pow(zht, 2) + 
         params.gamma3 * Math.pow(zht, 3) + 
         params.gamma4 * Math.pow(zht, 4)
  };



  var bpregression = {
    'male': {
    'systolic': {
               alpha: 102.19768,
               beta1: 1.82416,
               beta2: 0.12776,
               beta3: 0.00249,
               beta4: -0.00135,
               gamma1: 2.73157,
               gamma2: -0.19618,
               gamma3: -0.04659,
               gamma4: 0.00947,
               sigma: 10.7128

                },
    'diastolic': {
               alpha: 61.01217,
               beta1: 0.68314,
               beta2: -0.09835,
               beta3:0.01711,
               beta4: 0.00045,
               gamma1: 1.46993,
               gamma2:  -0.07849 ,
               gamma3:  -0.03144,
               gamma4: 0.00967,
               sigma: 11.6032 
    }
   },
   'female': {
    'systolic': {
               alpha:  102.01027,
               beta1:  1.94397,
               beta2:  0.00598,
               beta3:  -0.00789,
               beta4:  -0.00059,
               gamma1: 2.03526,
               gamma2:  0.02534,
               gamma3:  -0.01884,
               gamma4:  0.00121,
               sigma: 10.4855 

              },
    'diastolic': {
               alpha: 60.50510,
               beta1: 1.01301,
               beta2:  0.01157,
               beta3: 0.00424,
               beta4: -0.00137,
               gamma1: 1.16641,
               gamma2: 0.12795,
               gamma3:  -0.03869,
               gamma4: -0.00079,
               sigma: 10.9573
    }
   }
  };


  return ret;
})();

Math.erf = function(x) {
    var sign = 1;
    if (x < 0)
        sign = -1;

    x = Math.abs(x);

    // constants
    var a1 =  0.254829592,
        a2 = -0.284496736,
        a3 =  1.421413741,
        a4 = -1.453152027,
        a5 =  1.061405429,
        p  =  0.3275911;

    // A&S formula 7.1.26
    var t = 1.0/(1.0 + p*x);
    var y = 1.0 - (((((a5*t + a4)*t) + a3)*t + a2)*t + a1)*t*Math.exp(-x*x);
    return sign*y;
};

// whole-integer z-sores by percent
Math.zscore_for_percent = [
   -Infinity, -2.326, -2.054, -1.881, -1.751, -1.645, -1.555, 
   -1.476, -1.405, -1.341, -1.282, -1.227, -1.175, -1.126, 
   -1.08, -1.036, -0.994, -0.954, -0.915, -0.878, -0.842, 
   -0.806, -0.772, -0.739, -0.706, -0.674, -0.643, -0.613, 
   -0.583, -0.553, -0.524, -0.496, -0.468, -0.44, -0.412, 
   -0.385, -0.358, -0.332, -0.305, -0.279, -0.253, -0.228,
   -0.202, -0.176, -0.151, -0.126, -0.1, -0.075, -0.05, 
   -0.025, 0, 0.025, 0.05, 0.075, 0.1, 0.126, 0.151, 0.176,
    0.202, 0.228, 0.253, 0.279, 0.305, 0.332, 0.358, 0.385,
    0.412, 0.44, 0.468, 0.496, 0.524, 0.553, 0.583, 0.613,
    0.643, 0.674, 0.706, 0.739, 0.772, 0.806, 0.842, 0.878, 
    0.915, 0.954, 0.994, 1.036, 1.08, 1.126, 1.175, 1.227,
    1.282, 1.341, 1.405, 1.476, 1.555, 1.645, 1.751, 1.881,
    2.054, 2.326, Infinity];

// converts percentiles to z-scores (rouding to nearest percent)
Math.probit = function(p) {
    return Math.zscore_for_percent[Math.round(p * 100)];
};

Math.cdf = function(x) {
  return 0.5 * (1 + Math.erf(x/Math.sqrt(2)));
};

/**
* Find systolic and diastolic BP values corresponding to the given percentiles
*
* @param {Object} p Parameters include:
*                      height in meters, 
*                      age in years, 
*                      sex ('male' or 'female'), 
*                      systolic in percentile, 
*                      diastolic in percentile
*
* @returns {Object} Parameters include:
                       systolic in mmHg,
                       diastolic in mmHg
*/
var bp_thresholds = function(patient) {
    // Initialize local variables
    var age = patient.age,
        height = patient.height,
        sex = patient.sex,
        systolic = patient.systolic,
        diastolic = patient.diastolic;
    
    var null_result = 	{ 
	systolic: null, 
	diastolic: null
    };
    
    if (isNaN(patient.age) || 
	isNaN(patient.height) || 
	isNaN(patient.systolic) || 
	isNaN(patient.diastolic))
	return null_result;
    
    // Set the search bounds as tight as possible to speed up the search
    var lows = 0, lowd = 0,
        highs = 200, highd = 200,
        THRESHOLD = patient.result_precision || 1,
        LOOP_COUNT = 0, 
        MAX_LOOP_COUNT = 20;
        
    // Binary search for finding the solution
    do {
        // Calculate the current search values
        var mids = (highs + lows) / 2;
        var midd = (highd + lowd) / 2;
        
        // Calculate the percentiles for the current search values
        var res = bp_percentiles ({ age: age, 
				    height: height, 
				    sex: sex, 
				    systolic: mids, 
				    diastolic: midd, 
				    round_results: patient.round_results})
        
        if (res.systolic < systolic) lows = mids;
        else if (res.systolic >= systolic) highs = mids;
        
        if (res.diastolic < diastolic) lowd = midd;
        else if (res.diastolic >= diastolic) highd = midd;

	if (LOOP_COUNT++ >= MAX_LOOP_COUNT)
	    return null_result;
	
    } while ( Math.abs(res.systolic - systolic) >= THRESHOLD ||
	      Math.abs(res.diastolic - diastolic) >= THRESHOLD);
    
    if (patient.round_results) {
	highs = Math.ceil(highs);
	highd = Math.ceil(highd);

	do {
	    if (res.systolic == systolic)
		highs--;
	    
	    if (res.diastolic == diastolic)
		highd--;
	    
	    res = bp_percentiles ({age: age, 
				   height: height, 
				   sex: sex, 
				   systolic: highs, 
				   diastolic: highd, 
				   round_results: true})
	    
	} while (res.systolic == systolic ||
		 res.diastolic == diastolic);
	highs++;
	highd++;
    };
    
    // Return the result
    return {
        systolic: highs,
        diastolic: highd
    };
    
};

var HEIGHT_STALENESS_DATA = 
[{sex: 'male', age: 1, height_stale_after: 0.2},
{sex: 'male', age: 2, height_stale_after: 0.2},
{sex: 'male', age: 3, height_stale_after: 0.2},
{sex: 'male', age: 4, height_stale_after: 0.2},
{sex: 'male', age: 5, height_stale_after: 0.2},
{sex: 'male', age: 6, height_stale_after: 0.08},
{sex: 'male', age: 7, height_stale_after: 0.2},
{sex: 'male', age: 8, height_stale_after: 0.2},
{sex: 'male', age: 9, height_stale_after: 0.2},
{sex: 'male', age: 10, height_stale_after: 0.2},
{sex: 'male', age: 11, height_stale_after: 0.2},
{sex: 'male', age: 12, height_stale_after: 0.2},
{sex: 'male', age: 13, height_stale_after: 0.2},
{sex: 'male', age: 14, height_stale_after: 0.2},
{sex: 'male', age: 15, height_stale_after: 0.2},
{sex: 'male', age: 16, height_stale_after: 0.2},
{sex: 'male', age: 17, height_stale_after: 0.2},
{sex: 'male', age: 18, height_stale_after: 0.2},
{sex: 'female', age: 1, height_stale_after: 0.5},
{sex: 'female', age: 2, height_stale_after: 0.75},
{sex: 'female', age: 3, height_stale_after: 1.25},
{sex: 'female', age: 4, height_stale_after: 1.25},
{sex: 'female', age: 5, height_stale_after: 1.25},
{sex: 'female', age: 6, height_stale_after: 1.25},
{sex: 'female', age: 7, height_stale_after: 1.5},
{sex: 'female', age: 8, height_stale_after: 1.75},
{sex: 'female', age: 9, height_stale_after: 2.25},
{sex: 'female', age: 10, height_stale_after: 2.25},
{sex: 'female', age: 11, height_stale_after: 2},
{sex: 'female', age: 12, height_stale_after: 1.75},
{sex: 'female', age: 13, height_stale_after: 2.25},
{sex: 'female', age: 14, height_stale_after: 4.5},
{sex: 'female', age: 15, height_stale_after: 8.5},
{sex: 'female', age: 16, height_stale_after: 14.5},
{sex: 'female', age: 17, height_stale_after: 22},
{sex: 'female', age: 18, height_stale_after: 30.75}];

/*
var HEIGHT_STALENESS_DATA = 
[{sex: 'male', age: 1, height_stale_after: 0.5},
{sex: 'male', age: 2, height_stale_after: 0.5},
{sex: 'male', age: 3, height_stale_after: 0.75},
{sex: 'male', age: 4, height_stale_after: 1},
{sex: 'male', age: 5, height_stale_after: 1},
{sex: 'male', age: 6, height_stale_after: 1},
{sex: 'male', age: 7, height_stale_after: 1.25},
{sex: 'male', age: 8, height_stale_after: 1.25},
{sex: 'male', age: 9, height_stale_after: 1.75},
{sex: 'male', age: 10, height_stale_after: 1.75},
{sex: 'male', age: 11, height_stale_after: 1.75},
{sex: 'male', age: 12, height_stale_after: 1.75},
{sex: 'male', age: 13, height_stale_after: 1.25},
{sex: 'male', age: 14, height_stale_after: 1.5},
{sex: 'male', age: 15, height_stale_after: 2},
{sex: 'male', age: 16, height_stale_after: 3.5},
{sex: 'male', age: 17, height_stale_after: 6.5},
{sex: 'male', age: 18, height_stale_after: 11.5},
{sex: 'female', age: 1, height_stale_after: 0.5},
{sex: 'female', age: 2, height_stale_after: 0.75},
{sex: 'female', age: 3, height_stale_after: 1.25},
{sex: 'female', age: 4, height_stale_after: 1.25},
{sex: 'female', age: 5, height_stale_after: 1.25},
{sex: 'female', age: 6, height_stale_after: 1.25},
{sex: 'female', age: 7, height_stale_after: 1.5},
{sex: 'female', age: 8, height_stale_after: 1.75},
{sex: 'female', age: 9, height_stale_after: 2.25},
{sex: 'female', age: 10, height_stale_after: 2.25},
{sex: 'female', age: 11, height_stale_after: 2},
{sex: 'female', age: 12, height_stale_after: 1.75},
{sex: 'female', age: 13, height_stale_after: 2.25},
{sex: 'female', age: 14, height_stale_after: 4.5},
{sex: 'female', age: 15, height_stale_after: 8.5},
{sex: 'female', age: 16, height_stale_after: 14.5},
{sex: 'female', age: 17, height_stale_after: 22},
{sex: 'female', age: 18, height_stale_after: 30.75}];
*/

var getHeightStaleness = function (sex, age) {
	var res;
	for (var i = 0; i < HEIGHT_STALENESS_DATA.length; i++) {
		if (HEIGHT_STALENESS_DATA[i].sex == sex && HEIGHT_STALENESS_DATA[i].age == getYears(age)) {
			res = HEIGHT_STALENESS_DATA[i].height_stale_after;
			break;
		}
	}
	console.log (sex + "," + age + " -> " + res);
	return res;
}
