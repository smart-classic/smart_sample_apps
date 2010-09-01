/**
 * @tag models, home
 * Wraps backend rdf object.
 */
$.Model.extend('BlueButtonImport.Models.Handler',
/* @Static */
{
    
},
/* @Prototype */
{	
	init: function(options) { 
	  this.parser = options.parser;
	  this.matcher = options.matcher;
	  this.action = options.action;
	  return;
	}
});