//steal/js cookbook/scripts/compress.js

load("steal/rhino/steal.js");
steal.plugins('steal/build','steal/build/scripts','steal/build/styles',function(){
	steal.build('med_list/med_list.html',{to: 'med_list'});
});
