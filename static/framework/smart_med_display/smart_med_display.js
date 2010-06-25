steal.plugins('jquery/controller','jquery/controller/subscribe',
			  'jquery/view/micro',
			  'jquery/model/store',
			  'jquery/model',
			  'jquery/dom/fixture',
	      'jquery/dom/form_params' 		)
	      .then("scripts/class")
	      .then("scripts/json2")
	      .then("scripts/smart-api-client")
	      .then('scripts/jquery.hotkeys')
	      .then('scripts/jquery.addons')
	      .then('scripts/jquery.rdfquery.core-1.0')
    .create_link("/framework/smart_med_display/stylesheets/med_display.css") // this is bad, need good path interp.
    .resources()
     .models("rdfObject", "med")
     .controllers('keybind', 'med_list', 'med_display')
     .views();
