EMRView.plugin.carouselLoaded = false;

EMRView.plugin.initCarousel = function(manifests){
	jQuery("#emr_view_plugin_carousel").show("slide",{ direction: "right" }, 1000);
	var appcarousel = jQuery("#mycarousel");

	if(!EMRView.plugin.carouselLoaded){

           // Populate a carousel element for each available app.
           jQuery.each(manifests, function(i,m) {
             var app = jQuery("<li><img src='"+m.icon+"' class='tooltip-default' title='"+m.name+ ": " + m.description + "'><br/><span style='font-size:11px;'>"+m.name+"</span></li>");
             appcarousel.append(app);


             // Set Click Event for every app icon in Carousel

             app.click(function(){
                var $dialog = $('<div></div>')
                .html("<img src='"+m.icon+"' align='left' style='padding-right:5px'> "+ m.description)
                .dialog({
                   autoOpen: false,
                   title: m.name,
                   modal: true,
                   buttons: {
                    "Add this app": function() {
                      $('.appwidget-locator').remove();
                      $('li.widget.widget-color.ui-emr-widget').each(function(index){
                           var currentAppWidget = $(this).attr('id');
                           $("<li class='appwidget-locator ui-state-disabled widget'><button>Add '"+m.name+"' Here</button></li>").insertBefore("#"+currentAppWidget).click(function(){
                                var frame_id = EMRView.canvas.createAppWidgetBefore(m.id,m.name,currentAppWidget);
                                EMRView.canvas.configAppWidget();
                                var app_context = jQuery.extend({}, SMART.context);
                                app_context.record = {
                                    id: $("#record_id").val(),
                                    full_name: $("#record_name").val()
                                };
                                SMART_HOST.launch_app(m, app_context, {elt: $("#frame"+frame_id)});
                                $('.appwidget-locator').remove();
								canvasChange = true;
				EMRView.general.showNotice('App successfully added.');

                                EMRView.canvas.viewColumns(EMRView.canvas.numOfColumns,'columns');
                                return false;
                           });
                      });

                      // Handle last
                      $('.column.ui-sortable').each(function(index){
                           //assume there's no <li> in the <ul>
                           var canvasColumn = $(this).attr('id');
                           $("<li class='appwidget-locator ui-state-disabled widget'><button>Add '"+m.name+"' Here</button></li>").appendTo("#"+canvasColumn).click(function(){
                                var frame_id = EMRView.canvas.createAppWidgetAppend(m.id,m.name,canvasColumn);
                                EMRView.canvas.configAppWidget();
                                var app_context = jQuery.extend({}, SMART.context);
                                app_context.record = {
                                    id: $("#record_id").val(),
                                    full_name: $("#record_name").val()
                                };
                                SMART_HOST.launch_app(m, app_context, {elt: $("#frame"+frame_id)});
                                $('.appwidget-locator').remove();
								canvasChange = true;

				EMRView.general.showNotice('App successfully added.');

                                EMRView.canvas.viewColumns(EMRView.canvas.numOfColumns,'columns');

                                return false;
                           });

                      });

                      $(".appwidget-locator button").button({
                           icons: {
                                primary: "ui-icon-circle-plus"
                           }
                      });

                      $( this ).dialog( "close" );
                    },
                    Cancel: function() {
                      $( this ).dialog( "close" );
                    }
                   }
                });

                $dialog.dialog('open');
                return false;
             });
           });

           if(manifests.length > 0){
              jQuery('#mycarousel').jcarousel({
                vertical: false,
                size: manifests.length,
                visible: 5,
                scroll: 5
              });
	   }

	   EMRView.plugin.carouselLoaded = true;
	}
	
	   jQuery("#emr_view_edit_entrance").hide();

}

EMRView.plugin.showCarousel = function(){

	jQuery("#emr_view_edit_entrance").hide();
        jQuery("#emr_view_plugin_carousel").show("slide",{ direction: "right" }, 1000);

}

EMRView.plugin.hideCarousel = function(){

	jQuery("#emr_view_plugin_carousel").hide("slide",{ direction: "right" }, 1000, function(){
		jQuery("#emr_view_edit_entrance").show();
	});


}