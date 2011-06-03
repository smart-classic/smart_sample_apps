// Regression parameters from: http://www.cc.nih.gov/ccc/pedweb/pedsstaff/bp.html
//                             http://www.nhlbi.nih.gov/health/prof/heart/hbp/hbp_ped.pdf
// Retrieved 4/6/2011
// JS by:  Josh Mandel
// Revisions:
//      2011-06-02  Added BP Thresholds search method (NJS)


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

    return {
      systolic: Math.round(Math.cdf(zsys)*100),
      diastolic: Math.round(Math.cdf(zdias)*100)
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
    
    // Set the search range as thight as possible to speed up the search
    var lows = 40, lowd = 40,
        highs = 160, highd = 160;
        
    // Binary search for a solution
    while (lows < highs - 1 || lowd < highd - 1) {
        
        // Calculate the current search values
        var mids = Math.round((highs + lows) / 2);
        var midd = Math.round((highd + lowd) / 2);
        
        // Calculate the percentiles for the current search values
        var res = bp_percentiles ({age: age, height: height, sex: sex, systolic: mids, diastolic: midd});
        
        // No solution is possible
        if (!res.systolic || !res.diastolic) {
            return {
                systolic: null,
                diastolic: null
            };
        }
        
        // Update the lower and upper bounds
        if (res.systolic < systolic) lows = mids;
        else if (res.systolic >= systolic) highs = mids;
        
        if (res.diastolic < diastolic) lowd = midd;
        else if (res.diastolic >= diastolic) highd = midd;
        
    }
    
    // Return the result
    return {
        systolic: highs,
        diastolic: highd
    };
    
};
