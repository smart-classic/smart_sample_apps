/**
* Returns the decimal representation of the years difference between d1 and d2
*
* @param {String} d1 Date string for the first date
* @param {String} d2 Date string for the second date
*
* @returns {Number} A decimal number representing the years difference
*/
var years_apart = function(d1, d2) {

    // Parse the dates
    d1 = parse_date(d1);
    d2 = parse_date(d2);
    
    // The diffYears method in XDate returns the years difference as
    // a decimal fraction
    var res = d1.diffYears(d2) ; 
    
    // The difference should always be a positive number
    return Math.abs(res);
};

/**
* Returns the age at a given date with respect to the birth date
*
* @param {String} date Date string for the current date
* @param {String} birthDate Date string for the birthday
*
* @returns {Number} The age
*/
var getAge = function  (date, birthDate) {
    // Based on http://stackoverflow.com/questions/4060004/calculate-age-in-javascript (2012-03-29)

    var d1 = parse_date(date);
    var d2 = parse_date(birthDate);
    
    var age = d1.getFullYear() - d2.getFullYear();
    var m = d1.getMonth() - d2.getMonth();
    
    if (m < 0 || (m === 0 && d1.getDate() < d2.getDate())) {
        age--;
    }
    
    return age;
}

/**
* Wrapper for dates parsing
*/
var parse_date = function(d) {
    return new XDate(d);
};