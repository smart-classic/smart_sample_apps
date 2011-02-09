//Steal/js cookbook/scripts/compress.js

load("steal/rhino/steal.js");
steal.plugins('steal/build','steal/build/scripts','steal/build/styles',function(){
	steal.build('api_playground/index.html',{to: 'api_playground'});
});
