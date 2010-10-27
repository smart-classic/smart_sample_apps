steal.plugins(  
	      'jquery/controller',                    // a widget factory
	      'jquery/controller/subscribe',  // subscribe to OpenAjax.hub
	      'jquery/view/ejs',                              // client side templates
	      'jquery/model',                                 // Ajax wrappers
	      'jquery/dom/fixture',                   // simulated Ajax requests
	      'jquery/dom/form_params')               // form data helper
	      .then('scripts/class')
	      .then('scripts/json2')
	      .then('scripts/jschannel')
	      .then('scripts/smart-api-client')
	      .then('scripts/jquery.hotkeys')
	      .then('scripts/jquery.addons')
	      .then('scripts/date')
	      .then('scripts/jquery.form')
    .css('stylesheets/med_display')
     .models('rdf_object', 'med', 'med_details', 'problem')
     .controllers('keybind')
     .views();
