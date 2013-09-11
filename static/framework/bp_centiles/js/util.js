var BPC;
if (!BPC) {
    BPC = {};
}

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
* Returns the decimal representation of the years of age
*
* @param {String} birthDate The date of birth for the person
*
* @returns {Number} A decimal number representing the years of age
*/
var current_age = function(birthDate) {

    // Parse the dates
    d1 = new XDate();
    d2 = parse_date(birthDate);
    
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

// =============================================================================
// Localization system
// 
// USAGE ("BPC" just happens to be the major namespace here):
// 
// 1. Define some locales like this:
// BPC.createLocale({ language : "English"  , langAbbr : "en" });
// BPC.createLocale({ language : "Bulgarian", langAbbr : "bg" });
// 
// 2. Define some string translations like this:
// BPC.localizations = {
//    STR_SHORT_TERM_VIEW_1  : { 
//        en : "Short Term View",
//        bg : "Последни данни"
//    },
//    STR_LAST_THREE_BP_DAYS_2 : {
//        en : "Shows the last three BP measurements",
//        bg : "Последните три дни с измервания на кръвното налягане"
//    },
//    ...
// };
// 
// 3. To make the innerHTML of an element translatable use attr like:
// data-translatecontent="STR_SHORT_TERM_VIEW_1"
// 
// 4. To make the value of an attribute translatable use attr like:
// data-translateattr="title=STR_LAST_THREE_BP_DAYS_2"
// 
// 5. To set the defaul (initial) locale set it's abbr as the value of the lang 
// attribute of the HTML tag like so:
// <html lang="en"> or <html lang="bg">
// 
// 6. To have a language selectors automatically generated for you, just provide 
// empty container for them having the CSS class "language-selector". You can 
// also define your custom styles for them like:
// .language-selector { ... }
// .language-selector span { /* The label styles */ }
// .language-selector select { /* The select itself */ }
// =============================================================================
(function(NS, $, undefined) {
    
    /**
     * Creates the locale object - one for each supported language.
     */
    NS.locales = {};
	
    /**
     * The factory for locale objects. Creates one and registers it at 
     * NS.locales using it's "langAbbr" as an unique key.
     */
	NS.createLocale = function(options) {
		var out = $.extend(true, {}, {
			
			/**
			 * The name of the language to use. This will be displayed at the 
			 * language selection UI controls and is ALWAYS in english.
			 * @type {String}
			 */
			language : null,
			
			/**
			 * The language abbreviation. This is a short string that can be 
			 * used to identify the language (used internaly as key to store the
			 * translated strings). If not provided, it will be set to the first
			 * three letters of the @language setting (lowercased). 
			 * @type {String}
			 */
			langAbbr : null,
			
			/**
			 * The writing dirrection of the language. Can be "ltr" or "rtl".
			 * Defaults to "ltr".
			 * @type {String}
			 */
			dir : "ltr",
			
			/**
			 * If we search for some string that has no translation defined for 
			 * the desired language, it can failback to the same string from the
			 * language identified by this abbr.
			 * @type {String}
			 */ 
			failback : "en",
			
			/**
			 * Set this to false to disable the locale. That will hide it from 
			 * the UI making it unreachable.
			 * @type {Boolean}
			 */
			enabled  : true
			// TODO: more options here (dates, units etc.)?
			
		}, options);
		
		// Currently "language" is the only required property so make sure to 
		// validate it
		out.language = $.trim(String(out.language));
		
		if (!out.language) {
			throw "Please define locale.language";
		}
		
		// Create "langAbbr" in case it is missing
		if (!out.langAbbr) {
			out.langAbbr = out.language.toLowerCase().substr(0, 3);
		}
		
		// Prevent failback recursion
		if ( out.failback == out.langAbbr ) {
			out.failback = null;
		}
		
		// Register self
		NS.locales[out.langAbbr] = out;
		
		// return the resulting object
		return out;
	};
	
    NS.getLanguage = function() {
        return $("html").attr("lang") || "en";
    };
    
    NS.setLanguage = function(lang) {
        $("html").attr("lang", lang).trigger("set:language", [lang]);
        return this;
    };
    
	NS.str = function( key, lang ) {
		
		if (key == "LANGUAGE") {
			return locales[NS.getLanguage()].language;
		}
		
		if ( !NS.localizations.hasOwnProperty( key ) ) {
			return "Missing string '" + key + "'";
		}
		
		lang = lang || NS.getLanguage();
		
		var locale = NS.locales[lang];
		
		if ( !locale ) {
			return "Missing locale for '" + lang + "'";
		}
		
		var o = NS.localizations[key];
		
		if ( !o.hasOwnProperty( lang ) ) {
			if (locale.failback) {
				return NS.str(key, locale.failback);
			}
			return "Missing translation for '" + key + "' / '" + lang + "'";
		}
		
		return o[lang];
	};
	
    function translateInnerHTML() {
        $(this).html(NS.str(this.getAttribute("data-translatecontent")));
    }
    
    function translateAttribute() {
        var src = this.getAttribute("data-translateattr"),
            pos = src.indexOf("="),
            attrName, attrValue;
        if (pos > -1) {
            attrName  = $.trim(src.substr(0, pos));
            attrValue = $.trim(src.substr(pos + 1));
            if (attrName && attrValue) {
                attrValue = NS.str(attrValue);
                $(this).attr(attrName, attrValue);
            }
        }
    }
    
    function translateHTML(context) {
        $('[data-translatecontent]',context || document).each(translateInnerHTML);
        $('[data-translateattr]',context || document).each(translateAttribute);
    }
    
    function createLanguageSelectors() {
        var len = 0, 
            enabledLocales = [],
            cur = NS.getLanguage();
        
        $.each(NS.locales, function(i, locale) {
            if (locale.enabled) {
                enabledLocales[len++] = locale;
            }
        });
        
        $(".language-selector").each(function(i, o) {
            $(o).empty();
            

            // Display the one or more than two languages as select
            var html = '<select name="language" class="language-select">';
            $.each(enabledLocales, function(i, locale) {
                html += '<option value="' + locale.langAbbr + '">' + 
                    locale.language + 
                    '</option>';
            });
            html += '</select>';
            
            $(o).append('<span data-translatecontent="STR_LANGUAGE_59"></span>: ').append(
                $(html).val(cur).change(function() {
                    NS.setLanguage($(this).val());
                })
            );
 
            $("html").bind("set:language", function(e, lang) {})

            
        });
    }
    
    /* When the DOM is ready:
     * 1. Create any language selects if needed.
     * 2. Start listening for language changes.
     * 3. Set the initial lang and do the initial translation.
     */
    $(function() {
        createLanguageSelectors();
        $("html").bind("set:language", function(e, lang) {
            $(".language-selector select").val(lang);
            translateHTML(e.target.parentNode || e.target);  
        });
        NS.setLanguage(NS.getLanguage());
    });
    
    
    
    NS.translateHTML = translateHTML;


})(BPC, jQuery);


