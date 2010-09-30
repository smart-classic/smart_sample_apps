steal.plugins('jquery/controller','jquery/controller/subscribe',
			  'jquery/view/ejs',
			  'jquery/model',
			  'jquery/dom/fixture',
	      'jquery/dom/form_params' 		)
	      .then('scripts/class')
	      .then('scripts/json2')
	      .then('scripts/smart-api-client')
	      .then('scripts/jquery.hotkeys')
	      .then('scripts/jquery.addons')
	      .then('scripts/date')
	      .then('scripts/jquery.form')
    .css('stylesheets/jquery-ui-1.8.2.custom')
    .css('stylesheets/med_display')
     .models('rdf_object', 'med', 'med_details', 'problem')
     .controllers('keybind')
     .views();
