steal.plugins('jquery/controller','jquery/controller/subscribe',
			  'jquery/view/ejs',
			  'jquery/model/store',
			  'jquery/model',
			  'jquery/dom/fixture',
	      'jquery/dom/form_params' 		)
	      .then('scripts/class')
	      .then('scripts/json2')
	      .then('scripts/smart-api-client')
	      .then('scripts/jquery.hotkeys')
	      .then('scripts/jquery.addons')
	      .then('scripts/date')
    .create_link('/framework/smart_med_display/stylesheets/jquery-ui-1.8.2.custom.css')// this is bad, need good path interp.
	      .create_link('/framework/smart_med_display/stylesheets/med_display.css')
    .resources()
     .models('rdfObject', 'med', 'med_details', 'problem')
     .controllers('keybind', 'med_list', 'problem_list', 'med_display','timeline')
     .views();
