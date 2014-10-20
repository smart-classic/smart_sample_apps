EMRView.plugin.allAppsLoaded = false;

EMRView.plugin.initAllApps = function(manifests){
	jQuery("#basic-modal-content").hide();
	var appshowall = jQuery("#showAllApps");

	if(!EMRView.plugin.allAppsLoaded){
	
           // Populate a carousel element for each available app.
           jQuery.each(manifests, function(i,m) {
		   	if (m.detailed === undefined) {
				m.detailed = "";
			}
				var appimg = jQuery("<div class='back'><< BACK</div><div class='appImage'><p class='appImage'><img src='" + m.icon + "' title='" + m.name + ": " + m.description + "'></p></div>");
				var apptitle = jQuery("<span class='titleBy'><span class='appTitle'><a href='#" + m.id + "' class='appTitle'>" + m.name + "</a></span><span class='by'>by: " + m.author + "</span></span>");
				var addAppListView = jQuery("<span class='addApp listView'>Add this app</span>");
				var appdesc = jQuery("<span class='appDescription ellipsis multiline'>" + m.description + "</span><span class='detailed'><span>" + m.detailed + "</span></span>");
				var appadded = jQuery("<div class='addApp iconView'><span class='addApp iconView'>Add this app</span></div>");
				var appcontentwrapper = jQuery("<div class='appContent'></div>");
				var appAddAll = jQuery(appcontentwrapper).append(apptitle).append(addAppListView).append(appdesc).append(appadded);
				var appsall = jQuery("<li></li>").prepend(appimg).append(appAddAll);
		
             appshowall.append(appsall);
			 
             // Set Click Event for every app icon
			appadded.click(function(){
				
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
					  $.modal.close(); // must call this!
                    },
                    Cancel: function() {
                      $( this ).dialog( "close" );
                    }
                   }
                });

                $dialog.dialog('open');
                return false;
             });
             
			  // Set Click Event for every app icon
			addAppListView.click(function(){
				
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
					  $.modal.close(); // must call this!
                    },
                    Cancel: function() {
                      $( this ).dialog( "close" );
                    }
                   }
                });

                $dialog.dialog('open');
                return false;
             });
            		 
             // Set Click Event for every app icon to display detail content
			appimg.each(function(){
				$(this).click(function(){
					if ($(this).parent().hasClass('selected')) {
						$(this).parent().find("div.back").css("display", "none");
						$(this).parent().removeClass("selected").siblings("div#basic-modal-content ul#showAllApps li")
						.css("display", "block")
						.parent()
						.find("span.detailed").hide().css("display", "none").parent().find("span.by").css("display", "none").parents().find("span.appDescription").show();
						$(this).parent("ul#showAllApps li").removeClass("addedDetailed").css("width", "auto");
						$(this).parents().find("div.showAllApp .sortApps").show();
						$("#showAllApps").children("li.viewApps2").css("width", "98%").css("display", "inline-block").find("span.listView").css("display", "inline");
						$("#showAllApps").children("li.viewApps2").find("span.iconView").css("display", "none");
						$("#showAllApps").children("li.viewApps2").find("span.appDescription").css("display", "inline");
					}
					else {
						$(this).parent("ul#showAllApps li").find("div.back").css("display", "block");
						$(this).parent("ul#showAllApps li").addClass("selected").siblings("div#basic-modal-content ul#showAllApps li")
						.css("display", "none")
						.parent()
						.find("span.detailed").show().css("display", "block").parent().find("span.by").css("display", "block").parents().find("span.appDescription").hide();
						$(this).parent("ul#showAllApps li").addClass("addedDetailed").css("width", "97%");
						$(this).parents().find("div.showAllApp .sortApps").hide();
						$("#showAllApps").children("li").find("span.listView").css("display", "none");
						$("#showAllApps").children("li").find("span.iconView").css("display", "block");
					}
				}); 
             }); 
			 // Set Click Event for every app title to display detail content
			 appcontentwrapper.each(function(){
				$(this).find("span.appTitle").click(function(){
					if ($(this).parents("ul#showAllApps li").hasClass('selected')) {
						$(this).parents("ul#showAllApps li").find("div.back").css("display", "none");
						$(this).parents("ul#showAllApps li").removeClass("selected").siblings("div#basic-modal-content ul#showAllApps li")
						.css("display", "block")
						.parent()
						.find("span.detailed").hide().parent().find("span.by").css("display", "none").parents().find("span.appDescription").show();
						$(this).parents("ul#showAllApps li").removeClass("addedDetailed").css("width", "auto");
						$(this).parents().find("div.showAllApp .sortApps").show();
						$("#showAllApps").children("li.viewApps2").css("width", "98%").css("display","inline-block").find("span.listView").css("display", "inline");
						$("#showAllApps").children("li.viewApps2").find("span.iconView").css("display", "none");
						$("#showAllApps").children("li.viewApps2").find("span.appDescription").css("display", "inline");
					}
					else {
						$(this).parents("ul#showAllApps li").find("div.back").css("display", "block");
						$(this).parents("ul#showAllApps li").addClass("selected").siblings("div#basic-modal-content ul#showAllApps li")
						.css("display", "none")
						.parent()
						.find("span.detailed").show().css("display", "block").parent().find("span.by").css("display", "block").parents().find("span.appDescription").hide();
						$(this).parents("ul#showAllApps li").addClass("addedDetailed").css("width", "97%");
						$(this).parents().find("div.showAllApp .sortApps").hide();
						$("#showAllApps").children("li").find("span.listView").css("display", "none");
						$("#showAllApps").children("li").find("span.iconView").css("display", "block");
						$('#filter').val('');

					}
					
				}); 
             }); 
			 
             
           }); // end manifests
	EMRView.plugin.allAppsLoaded = true;

	} //end if carousel loaded
	
	   jQuery("#emr_view_edit_entrance").hide();
	   jQuery("ul#showAllApps").children("li").find("div.appContent span.by").hide();
	   jQuery(".ellipsis").ellipsis();
}

