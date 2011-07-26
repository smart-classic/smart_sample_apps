/*
We start with fact that, as kids get older, BP curves (like growth
curves) flatten out.  So for older kids, we should be able to less
recent heights as "still valid."

How to quantify this?  For each month of age, we compute the height
change needed for an average-height normotensive boy or girl to rise
from the 50th to the 51st BP percentile (systolic or disatolic).  Then
we calculated how long that height change would take at the normal
rate of growth-for-age.  
*/

// we'll figure out what's needed to move 
// from BP_PERCENTILE --> BP_PERCENTILE + BP_DELTA
var BP_PERCENTILE = 90;
var BP_DELTA = 0.5;

// explore changes for a child in this height percentile?
var HEIGHT_PERCENTILE = 50; 

var MIN_AGE = 1;  // min age in years
var MAX_AGE = 18; // max age in years
var AGE_STEP = 1; // age step in years
var SANITY_THRESHOLD = 1; // try also 0.1

var sexes =['male', 'female'];

var compute_times = function() {

var results = [];

$.each(sexes, function(i, sex) {
  for (var age = MIN_AGE; age <= MAX_AGE; age+= AGE_STEP) {

    // Find the height of a child on the HEIGHT_PERCENTILE growth curve
    var mean_height = find_height_threshold({age: age, 
				             sex: sex, 
				             target: HEIGHT_PERCENTILE}) / 100.0;

    // Find the BP of this child assuming BP_PERCENTILE
    var bp = bp_thresholds({     age: age, 
				 sex: sex, 
				 height: mean_height, 
				 systolic: BP_PERCENTILE, 
				 diastolic: BP_PERCENTILE, 
				 result_precision: .01});

    meanbp = bp_percentiles({    age: age, 
				 sex: sex, 
				 height: mean_height, 
				 systolic: bp.systolic, 
				 diastolic: bp.diastolic});

    // (Sanity check the result.)
	
    if (Math.abs(meanbp.systolic - BP_PERCENTILE) > SANITY_THRESHOLD || Math.abs(meanbp.diastolic - BP_PERCENTILE) > SANITY_THRESHOLD) {
      console.log("The threshold binary search algorithm produced invalid output.");
      break;
    }

    // Slowly decrease the child's height until BP percentile is off by BP_DELT
    // (Call this difference `heightstep`.)
    for (var heightstep = 0; heightstep > -.2; heightstep -= .0001) {
      var bptaller = bp_percentiles({age: age, 
                                     sex: sex, 
                                     height: mean_height+heightstep, 
                                     systolic: bp.systolic, 
                                     diastolic: bp.diastolic});

      if (Math.abs(bptaller.systolic - meanbp.systolic) > BP_DELTA || 
          Math.abs(bptaller.diastolic - meanbp.diastolic > BP_DELTA)) {
        break;
      }
 
    }

    // Slowly dial back time along the growth curve 
    // until the child's height is smaller by `heightstep`
    for (var timestep = 0.0; timestep > -120; timestep-= .25) {
      var hearlier = find_height_threshold({age: age+timestep/12 , sex: sex, target: HEIGHT_PERCENTILE}) / 100.0;
      if (hearlier - mean_height < heightstep) {
        console.log(sex+"\t"+age+"\t"+timestep*-1)
	  results.push({sex: sex, age: age, height_stale_after: (-1*timestep)});
        break;
      }
    }
  }
});

return results;
};
