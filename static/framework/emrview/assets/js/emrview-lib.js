/*
 * SMART EMR View App: emrview-lib.js
 * Version 1.01
 * Nich Wattanasin
 *
 * 1.01 (4/9/12): IE support
 * 1.0  (4/5/12): Initial release 
 */

var EMRViewDebugMode = false;  // This value is for internal use only and should be left as false
var EMRView = {general:{},canvas:{},events:{},views:{},plugin:{}};

EMRView.canvas.numOfColumns = 2;
EMRView.canvas.preferences;
EMRView.canvas.manifests;
EMRView.canvas.zoomedMemoryColumn;
EMRView.canvas.zoomedMemoryNextFrame;
EMRView.canvas.zoomedMemoryHeight;
EMRView.canvas.zoomedMemoryWidgetId;
EMRView.canvas.activeCanvasId;
EMRView.canvas.activeCanvasName;

EMRView.general.editMode = false;
var canvasChange = false;

EMRView.canvas.createAppWidgetBefore = function(app_id,title,prepend_id){
	var appwidget_id = createAppWidgetId(app_id);
	jQuery("<li id='"+appwidget_id+"' class='widget widget-color ui-emr-widget'><div class='widget-head'><a href='#' class='zoom'>Zoom</a> <a href='#' class='close'>Close</a><h3>"+title+"</h3></div><div class='widget-content ui-state-disabled'><iframe SEAMLESS webkitAllowFullScreen mozallowfullscreen allowFullScreen src='about:blank' id='frame"+appwidget_id+"' class='iframemini' width='100%' height='100%' border='0' frameborder='0'> </iframe></div><div class='widget-foot clearfix'><a href='#' class='collapse increaseHeight'>view more</a><a class='collapse decreaseHeight' style='float: right;' href='#'>view less</a></div></li>").hide().insertBefore("#"+prepend_id).show('drop', {}, 500);

	return appwidget_id;

}

EMRView.canvas.createAppWidgetAfter = function(app_id,title,append_id){
        var appwidget_id = createAppWidgetId(app_id);
        jQuery("<li id='"+appwidget_id+"' class='widget widget-color ui-emr-widget'><div class='widget-head'><a href='#' class='zoom'>Zoom</a> <a href='#' class='close'>Close</a><h3>"+title+"</h3></div><div class='widget-content ui-state-disabled'><iframe SEAMLESS webkitAllowFullScreen mozallowfullscreen allowFullScreen src='about:blank' id='frame"+appwidget_id+"' class='iframemini' width='100%' height='100%' border='0' frameborder='0'> </iframe></div><div class='widget-foot clearfix'><a href='#' class='collapse increaseHeight'>view more</a><a class='collapse decreaseHeight' style='float: right;' href='#'>view less</a></div></li>").hide().insertAfter("#"+append_id).show('drop', {}, 500);

        return appwidget_id;

}

EMRView.canvas.createAppWidgetAppend = function(app_id,title,append_id){
        var appwidget_id = createAppWidgetId(app_id);
        jQuery("<li id='"+appwidget_id+"' class='widget widget-color ui-emr-widget'><div class='widget-head'><a href='#' id='zoomlink"+appwidget_id+"' onclick=\"javascript:EMRView.canvas.zoomAppWidget('"+appwidget_id+"');\" class='zoom'>Zoom</a> <a href='#' class='close'>Close</a><h3>"+title+"</h3></div><div class='widget-content ui-state-disabled'><div class='widget-cover' style='display:none; position: absolute; float:left; min-height: 100%; height: 100%; width: 100%; '></div><iframe SEAMLESS webkitAllowFullScreen mozallowfullscreen allowFullScreen src='about:blank' id='frame"+appwidget_id+"' class='iframemini' width='100%' height='100%' border='0' frameborder='0'> </iframe></div><div class='widget-foot clearfix'><a href='#' class='collapse increaseHeight'>view more</a><a class='collapse decreaseHeight' style='float: right;' href='#'>view less</a></div></li>").hide().appendTo("#"+append_id).show();

/*
        $("#"+appwidget_id+" a.zoom").click(function(event) {

        	//alert("class=" + ($this).attr('class'));

			//alert($(this).hasClass('zoom'));

	        	
		if($(this).hasClass('zoom')){
			$(this).attr("class", "zoomed");
	        	widgethead = $(this).parent(".widget-head");
	        	widgetcontent = $(this).parent(".widget-content");
	        	widget = widgethead.parent(".widget");
	        	column = widget.parent(".column");
	        	
	        	var widget_id = widget.attr('id');
	        	EMRView.canvas.zoomedMemoryWidgetId = widget_id;
	        	EMRView.canvas.zoomedMemoryNextFrame = widget.next().attr('id');
	        	//alert(EMRView.canvas.zoomedMemoryNextFrame);
	        	
	        	EMRView.canvas.zoomedMemoryColumn = column.attr('id');
	        	
	        	EMRView.canvas.zoomedMemoryHeight = $('#'+widget_id +' div.widget-content.ui-resizable').css('height');
	        	
	        	//alert(EMRView.canvas.zoomedMemoryColumn);
	        	widget.detach();
	
	        	$("#zoomview").css('height',window.innerHeight-75);
	
	        	widget.appendTo($("#zoomview"));
	        	$('#'+widget_id +' div.widget-content.ui-resizable').css('height',window.innerHeight-75);
	        	
	        	
        	}
        	else{
        		$(this).attr("class", "zoom");
        		widget.detach();
        		$("#zoomview").css('height','0px');
        		
        		if(EMRView.canvas.zoomedMemoryNextFrame==undefined){
        			$("#"+EMRView.canvas.zoomedMemoryColumn).append(widget);
        			$('#'+EMRView.canvas.zoomedMemoryWidgetId +' div.widget-content.ui-resizable').css('height',EMRView.canvas.zoomedMemoryHeight);
        		}
        		else{

        			$("#"+EMRView.canvas.zoomedMemoryNextFrame).before(widget);
        			$('#'+EMRView.canvas.zoomedMemoryWidgetId +' div.widget-content.ui-resizable').css('height',EMRView.canvas.zoomedMemoryHeight);
        			
        		}
//        		$(this).parent(".widget").remove().next();
        	}
        	
        	
//                $(".activeCloseButton").parent(".widget").remove().next();


                return false;
        });
        
        */

        return appwidget_id;
}

EMRView.canvas.createAppWidgetSingle = function(app_id,title,append_id){
        var appwidget_id = createAppWidgetId(app_id);
        jQuery("<li id='"+appwidget_id+"' class='widget widget-color ui-emr-widget'><div class='widget-head'><a href='#' class='close'>Close</a><h3>"+title+"</h3></div><div class='widget-content ui-state-disabled'><div class='widget-cover' style='display:none; position: absolute; float:left; min-height: 100%; height: 100%; width: 100%; '></div><iframe SEAMLESS webkitAllowFullScreen mozallowfullscreen allowFullScreen src='about:blank' id='frame"+appwidget_id+"' class='iframemini' width='100%' height='100%' border='0' frameborder='0'> </iframe></div></li>").hide().appendTo("#"+append_id).show();

        $("a.close").click(function() {
        $(this).parent(".widget-head").addClass("activeCloseButton")
        $(".activeCloseButton").parent(".widget").remove().next();
	jQuery("#launchview").hide();
        return false;
    	});


	return appwidget_id;
};

EMRView.canvas.zoomAppWidget2 = function(appwidget_id){
	goFullscreen('frame' + appwidget_id);
};

EMRView.canvas.zoomAppWidget = function(appwidget_id){

	var widgethead = $("#"+appwidget_id).find('div.widget-head');
	var widgetcontent = $("#"+appwidget_id).find('div.widget-content');
	var zoomlink = $("#zoomlink"+appwidget_id);

		if($(zoomlink).hasClass('zoom')){
			$(zoomlink).attr("class", "zoomed");
	        	widget = $("#"+appwidget_id);
	        	column = widget.parent(".column");
	        	
	        	//var widget_id = widget.attr('id');
	        	EMRView.canvas.zoomedMemoryWidgetId = appwidget_id;
	        	EMRView.canvas.zoomedMemoryNextFrame = widget.next().attr('id');
	        	//alert(EMRView.canvas.zoomedMemoryNextFrame);
	        	
	        	EMRView.canvas.zoomedMemoryColumn = column.attr('id');
	        	
	        	EMRView.canvas.zoomedMemoryHeight = $('#'+appwidget_id +' div.widget-content.ui-resizable').css('height');
	        	
	        	//alert(EMRView.canvas.zoomedMemoryColumn);
	        	widget.detach();
	
	        	$("#zoomview").css('height',window.innerHeight-75);
	
	        	widget.appendTo($("#zoomview"));
	        	$('#'+appwidget_id +' div.widget-content.ui-resizable').css('height',window.innerHeight-75);
	        	
	        	
        	}
        	else{
        		$(zoomlink).attr("class", "zoom");
        		widget = $("#"+appwidget_id);
        		widget.detach();
        		$("#zoomview").css('height','0px');
        		
        		if(EMRView.canvas.zoomedMemoryNextFrame==undefined){
        			$("#"+EMRView.canvas.zoomedMemoryColumn).append(widget);
        			$('#'+EMRView.canvas.zoomedMemoryWidgetId +' div.widget-content.ui-resizable').css('height',EMRView.canvas.zoomedMemoryHeight);
        		}
        		else{

        			$("#"+EMRView.canvas.zoomedMemoryNextFrame).before(widget);
        			$('#'+EMRView.canvas.zoomedMemoryWidgetId +' div.widget-content.ui-resizable').css('height',EMRView.canvas.zoomedMemoryHeight);
        			
        		}
//        		$(this).parent(".widget").remove().next();
        	}


};


EMRView.canvas.configAppWidget = function(){
	
	$(".widget-content").resizable({
		handles: 's',
        	minHeight: 60,
		start: function(event,ui){
                       	EMRView.events.startSortableEvent();
                },
		stop: function(event,ui){
                       	EMRView.events.stopSortableEvent();
                }
      	});
	$("a.close").click(function() {
       	$(this).parent(".widget-head").addClass("activeCloseButton")
        $(".activeCloseButton").parent(".widget").remove().next();
        return false;
    });
	$("a.increaseHeight").unbind("click").click(function () {
	    $(this).parent(".widget-foot").siblings(".widget-content").animate({height: '+=100', minHeight: '60'}, 500);
		return false;
	});
	$("a.decreaseHeight").unbind("click").click(function () {
	    $(this).parent(".widget-foot").siblings(".widget-content").animate({height: '-=100', minHeight: '60'}, 500);
		return false;
	});
	if (!canvasChange) {
		$(".column").sortable({
			update: function(event, ui){
				canvasChange = true;
			}
		});
		$("#columns .widget-content").bind("resizestop", function(event, ui){
			canvasChange = true;
		});
		$('a.close, a.increaseHeight, a.decreaseHeight, li.jcarousel-item, a.columnsLinkView > img').bind('click', function(){
			canvasChange = true;
		});
		$('.appwidget-locator').bind('click', function(){
		    canvasChange = true;
		});
	}
	
	window.onbeforeunload = function(){
        if(canvasChange){
            return 'You have not saved your changes yet. Do you want to leave without saving?';
        }
    };
	    /*
        $("a.zoom").unbind("click").click(function(event) {
        	//alert("class=" + ($this).attr('class'));

			//alert($(this).hasClass('zoom'));

	        	
	        	
		if($(this).hasClass('zoom')){
			$(this).attr("class", "zoomed");
	        	widgethead = $(this).parent(".widget-head");
	        	widgetcontent = $(this).parent(".widget-content");
	        	widget = widgethead.parent(".widget");
	        	
	        	var widget_id = widget.attr('id');
	        	EMRView.canvas.zoomedMemoryNextFrame = widget.next().attr('id');
	        	
	        	widget.detach();
	
	        	$("#zoomview").css('height',window.innerHeight-75);
	
	        	widget.appendTo($("#zoomview"));
	        	$('#'+widget_id +' div.widget-content.ui-resizable').css('height',window.innerHeight-75);
	        	
	        	
        	}
        	else{
        		widget.remove();
//        		$(this).parent(".widget").remove().next();
        	}
        	
        	
//                $(".activeCloseButton").parent(".widget").remove().next();


                return false;
        });
        */
	if(EMRView.general.editMode){
        	$("a.zoom").hide();
		$(".widget-content").resizable("option", "disabled", false);
	}
	else{
		$("a.close").hide();
		$(".widget-foot").hide();
	}
}

EMRView.canvas.loadCanvasId = function(canvas_id){
	
	if (canvasChange) {
		EMRView.canvas.promptToSave(EMRView.canvas.activeCanvasId, canvas_id);
	}
	else {
		//alert("id func default"+canvas_id);
		if(EMRViewDebugMode) alert("loadCanvasId('"+canvas_id+"')");
		var data = EMRView.canvas.getPreferences();
		var manifests = EMRView.canvas.getManifests();
		
		
		
		$(data).find('canvas').each(function(){
			if($(this).attr('id') == canvas_id){ // found canvas_id
		
			var canvas_name = $(data).find("view[id='" + canvas_id + "']").text();
			EMRView.canvas.activeCanvasName = canvas_name;
			EMRView.canvas.removeColumns('columns');
			
			var saved_column_num = $(this).find('column').size();
			if (saved_column_num <= 3) {
				EMRView.canvas.createColumns(saved_column_num, 'columns');
			}
			
			var active_column_num = 1;
			
			$(this).find('column').each(function(){
				$(this).find('widget').each(function(){
					var active_manifest_id = $(this).find('id').text();
					var active_manifest_height = $(this).find('height').text();
					$.each(manifests, function(i, m){
						if (m.id == active_manifest_id) {
							var canvasColumn = 'column' + active_column_num;
							var frame_id = EMRView.canvas.createAppWidgetAppend(m.id, m.name, canvasColumn);
							EMRView.canvas.configAppWidget();
							var app_context = jQuery.extend({}, SMART.context);
							app_context.record = {
								id: $("#record_id").val(),
								full_name: $("#record_name").val()
							};
							SMART_HOST.launch_app(m, app_context, {
								elt: $("#frame" + frame_id)
							});
							EMRView.canvas.viewColumns(saved_column_num, 'columns');
							$('#' + frame_id + ' div.widget-content.ui-resizable').css('height', active_manifest_height);
						}
					});
				});
				active_column_num++;
			});
			
			if (EMRViewDebugMode) 
				alert("start unbinding click events");
			$('#emrview-view-save').unbind('click').click(function(){
				EMRView.canvas.saveCanvasId(canvas_id);
				return false;
			});
			
			$('a#link_normal_mode').unbind('click').click(function(){
				var $canvasDialog = $('<div></div>').html("<img src='assets/img/edit.png' align='left' style='padding-right:5px'>Save canvas changes?").dialog({
					autoOpen: false,
					title: 'Confirm save canvas changes',
					modal: true,
					width: 350,
					buttons: {
						"Yes, Proceed": function(){
							EMRView.canvas.saveCanvasId(canvas_id);
							canvasChange = false;
							EMRView.general.loadNormalMode();
							$(this).dialog("close");
							
						},
						Cancel: function(){
							canvasChange = false;
							EMRView.general.loadNormalMode();
							$(this).dialog("close");
							
						}
					}
				});
				if (canvasChange != true) {
					EMRView.general.loadNormalMode();
					return false;
				}
				else {
					$canvasDialog.dialog("open");
				}
				return false;
			});
			
			
			
			$('#emrview-view-rename').unbind('click').click(function(){
				EMRView.views.renameView(canvas_id);
			});
			
			$('#emrview-view-delete').unbind('click').click(function(){
				EMRView.views.deleteView(canvas_id);
			});
			
			if (EMRViewDebugMode) 
				alert("finished unbinding click events");
			$('#emrview-view-name').html(canvas_name);
			EMRView.views.setHighlight(canvas_id);
			EMRView.views.setDefaultCanvas(canvas_id);
			
		}
		
		});
			
	}
}

EMRView.canvas.loadCanvas = function(optional_canvas_id){

	//loops thru canvas, display table with links
	//find default one and load

    var data = EMRView.canvas.getPreferences();
	var canvas_default;
	var canvas_last_found;

	$('#emrview-views').empty();

        jQuery(data).find('view_set').each(function(){
		if(EMRViewDebugMode) alert('found a view_set');
		$(this).find('view').each( function(){
			var canvas_id = $(this).attr('id');
			var canvas_name = $(this).text();
			canvas_last_found = canvas_id;

			if($(this).attr('default') == 'true'){
				canvas_default = canvas_id;

                $("<div><span style='float:right;margin-top:3px;cursor:move;display:none;'><img src='assets/img/handle.png'/></span><h4 id='view-" + canvas_id + "' class='viewHeaderText ui-widget-content ui-state-hover'><a href='#' class='linkViewCanvas' id='linkView-" + canvas_id + "' rel='" + canvas_id + "' onclick='javascript:EMRView.canvas.loadCanvasId\(\"" + canvas_id + "\"\);return false;'>" + canvas_name + "</a></h4></div>").appendTo('#emrview-views');
			}
			else {
				$("<div><span style='float:right;margin-top:3px;cursor:move;display:none;'><img src='assets/img/handle.png'/></span><h4 id='view-" + canvas_id + "' class='viewHeaderText ui-widget-content'>			   <a href='#' class='linkViewCanvas' id='linkView-" + canvas_id + "' rel='" + canvas_id + "' onclick='javascript:EMRView.canvas.loadCanvasId\(\"" + canvas_id + "\"\);return false;'>" + canvas_name + "</a></h4></div>").appendTo('#emrview-views');
			}
			
		});
        });

	if(EMRView.general.editMode){
	$("#emrview-views span").show();
        $( "#emrview-views" ).sortable({
                axis: "y",
                placeholder: "ui-state-highlight",
                handle: "img",
                stop: function(event,ui){
                        EMRView.views.saveViewList();
                }
        });
        $( "#sortable" ).disableSelection();
	}
	if(EMRViewDebugMode) alert('optional_canvas_id = ' + optional_canvas_id); // undefined
	if(EMRViewDebugMode) alert('canvas_default = ' + canvas_default); //problems40
	if(EMRViewDebugMode) alert('canvas_last_found = ' + canvas_last_found); //vital-signs791

	if(optional_canvas_id == undefined){
		if(canvas_default == undefined){
			EMRView.canvas.loadCanvasId(canvas_last_found);
		}
		else{
			EMRView.canvas.loadCanvasId(canvas_default);
		}
	}
	else{
		EMRView.canvas.loadCanvasId(optional_canvas_id);
	}


}

EMRView.canvas.promptToSave = function(activeCanvasId, newCanvasId){
	
	var $canvasDialog = $('<div></div>').html("<img src='assets/img/edit.png' align='left' style='padding-right:5px'>The <strong>"+EMRView.canvas.activeCanvasName+"</strong> view has unsaved changes. Would you like to save your changes before continuing?").dialog({
					autoOpen: false,
					title: 'Detected unsaved changes',
					modal: true,
					width: 350,
					buttons: {
						"Yes (Save Changes)": function(){
							EMRView.canvas.saveCanvasId(activeCanvasId);
							canvasChange = false;
							EMRView.canvas.loadCanvasId(newCanvasId);
							$(this).dialog("close");
						},
						"No": function(){
							canvasChange = false;
							EMRView.canvas.loadCanvasId(newCanvasId);
							$(this).dialog("close");
						}
					}
	});
	$canvasDialog.dialog("open")
	
}

EMRView.events.startSortableEvent = function(){
	// get all div handles of coverups
	// resize them all
	// 
	$('div.widget-cover').show();

	//alert('sortable started');

};

EMRView.events.stopSortableEvent = function(){

	$('div.widget-cover').hide();
	//alert('sortable stopped');

};

EMRView.views.setHighlight = function(canvas_id){
	var view_list = jQuery('h4.ui-widget-content');
	jQuery.each(view_list, function(){
		if($(this).attr('id') == "view-"+canvas_id){
			$(this).removeClass('ui-state-hover').addClass('ui-state-hover');
			
		}
		else {
			$(this).removeClass('ui-state-hover');
		}
	});
}

EMRView.canvas.saveCanvasId = function(canvas_id){

        var data = EMRView.canvas.getPreferences();
	
	if(jQuery.browser.msie){
            var col_list = jQuery('.column.ui-sortable');

            canvasElements = data.getElementsByTagName("canvas");
	    for(i=0;i<canvasElements.length;i++){
                if(canvasElements[i].getAttribute('id') == canvas_id){
                    while(canvasElements[i].hasChildNodes()){
                        canvasElements[i].removeChild(canvasElements[i].lastChild);
                    }
                }
            }

            jQuery.each(col_list, function(){
		newColumnElement = data.createElement("column");  // <column>
		var column_id = $(this).attr('id');
                var app_list = jQuery('#'+column_id +' .widget.widget-color.ui-emr-widget');

                jQuery.each(app_list, function(){
		    newWidgetElement = data.createElement("widget"); // <widget>
                    var app_widget_id = $(this).attr('id');
                    var app_widget_array = app_widget_id.split('____');

                    var app_id = getRealAppId(app_widget_array[0]);
                    var app_height = $('#'+app_widget_id +' .widget-content.ui-resizable').css('height');

		    newIdElement = data.createElement("id"); // <id>
		    newIdElement.appendChild(data.createTextNode(app_id));
		    newHeightElement = data.createElement("height"); //<height>
		    newHeightElement.appendChild(data.createTextNode(app_height));

		    newWidgetElement.appendChild(newIdElement);
		    newWidgetElement.appendChild(newHeightElement);

		    newColumnElement.appendChild(newWidgetElement);
                });


		canvasElements = data.getElementsByTagName("canvas");
		for(i=0;i<canvasElements.length;i++){
		    if(canvasElements[i].getAttribute('id') == canvas_id){
			canvasElements[i].appendChild(newColumnElement);
		    }
		}
            });

	    if(EMRViewDebugMode) alert(data.xml);
            EMRView.canvas.setPreferences(data.xml);
	}
	else{
	    
	    var saveXML = "\n";
	    var col_list = jQuery('.column.ui-sortable');
            jQuery.each(col_list, function(){
                    saveXML += "   <column>\n";
                    var column_id = $(this).attr('id');
                    var app_list = jQuery('#'+column_id +' .widget.widget-color.ui-emr-widget');

                    jQuery.each(app_list, function(){
                            saveXML += "      <widget>\n";
                            var app_widget_id = $(this).attr('id');
                            var app_widget_array = app_widget_id.split('____');

                            var app_id = getRealAppId(app_widget_array[0]);
                            var app_height = $('#'+app_widget_id +' .widget-content.ui-resizable').css('height');

                            saveXML += "         <id>"+app_id+"</id>\n";
                            saveXML += "         <height>"+app_height+"</height>\n";
                            saveXML += "      </widget>\n";
                    });
                    saveXML += "   </column>\n";
            });

    	    var $canvasXML = $('<dummy />').append(data);

	    $canvasXML.find("canvas[id='"+canvas_id+"']").html(saveXML);
	
	    EMRView.canvas.setPreferences($canvasXML.html());
	}
canvasChange = false;
//	alert($canvasXML.html());
}

EMRView.views.saveViewList = function(){

        var data = EMRView.canvas.getPreferences();

        if(jQuery.browser.msie){

	    while(data.getElementsByTagName("view_set")[0].hasChildNodes()) {
    		data.getElementsByTagName("view_set")[0].removeChild(data.getElementsByTagName("view_set")[0].lastChild);
	    }
            var view_list = jQuery("#emrview-views h4");
            jQuery.each(view_list, function(){
                var view_id = $(this).attr('id').substr(5);
                var view_name = $(this).find("a").text();

                if($(this).attr('class') == 'ui-widget-content ui-state-hover'){
			newViewElement = data.createElement("view");
			newViewElement.setAttribute("id", view_id);
			newViewElement.setAttribute("default", "true");
			newViewElement.appendChild(data.createTextNode(view_name));

			data.getElementsByTagName("view_set")[0].appendChild(newViewElement);

                }
                else{
                        newViewElement = data.createElement("view");
                        newViewElement.setAttribute("id", view_id);
                        newViewElement.appendChild(data.createTextNode(view_name));

                        data.getElementsByTagName("view_set")[0].appendChild(newViewElement);

//                        saveXML += "   <view id='"+ view_id +"'>"+ view_name +"</view>\n";
                }
        });

//	alert(data.xml);	   
            EMRView.canvas.setPreferences(data.xml,'true');
        }
	else{

        var saveXML = "\n";
        var view_list = jQuery("#emrview-views h4");
        jQuery.each(view_list, function(){
                var view_id = $(this).attr('id').substr(5);
                var view_name = $(this).find("a").text();

                if($(this).attr('class') == 'ui-widget-content ui-state-hover'){
                        saveXML += "   <view id='"+ view_id +"' default='true'>"+ view_name +"</view>\n";
                }
                else{
                        saveXML += "   <view id='"+ view_id +"'>"+ view_name +"</view>\n";
                }
        });






            var $canvasXML = $('<dummy />').append(data);
            $canvasXML.find("view_set").html(saveXML);
       	    EMRView.canvas.setPreferences($canvasXML.html(),'true');
	}
	EMRView.general.showNotice('Sorting Saved.');

//	alert('Sorting Saved');
//        alert($canvasXML.html());
}

EMRView.views.renameView = function(view_id){

        var data = EMRView.canvas.getPreferences();
	
	if(jQuery.browser.msie){
            viewElements = data.getElementsByTagName("view");
            for(i=0;i<viewElements.length;i++){
                if(viewElements[i].getAttribute('id') == view_id){
                    var old_viewname = viewElements[i].childNodes[0].nodeValue;
		    if(EMRViewDebugMode) alert("old_viewname=" + old_viewname);
                }
            }
	}
	else{
	    var $canvasXML = $('<dummy />').append(data);
	    var old_viewname = $canvasXML.find("view[id='"+view_id+"']").text();
	}

        var $dialog = $('<div></div>')
        .html("Current Title: <font face='Courier New'>"+old_viewname+"</font><br/>New Title: <input type='text' id='newviewname' value='"+htmlEscape(old_viewname)+"' />")
        .dialog({
            autoOpen: false,
            title: 'Rename View',
            modal: true,
            buttons: {
                "Accept": function() {
		    //alert(old_viewname+"="+$('#newviewname').val())
		    if(old_viewname != $('#newviewname').val()){
		    var new_viewname = htmlEscape($('#newviewname').val());
                    var new_viewid = $('#newviewname').val().toLowerCase().replace(' ','-').replace(/[^A-Za-z\-]/g,"") + Math.floor(Math.random()*1000);
		    //alert('newviewname=' + new_viewname);

		    if(jQuery.browser.msie){

			    viewElements = data.getElementsByTagName("view");
 	                    for(i=0;i<viewElements.length;i++){
                    		if(viewElements[i].getAttribute('id') == view_id){
                                    while(viewElements[i].hasChildNodes()){
                                        viewElements[i].removeChild(viewElements[i].lastChild);
                                    }
                                    viewElements[i].appendChild(data.createTextNode(new_viewname));
	                            viewElements[i].setAttribute("id", new_viewid);
                    		}
                	    }
                            canvasElements = data.getElementsByTagName("canvas");
                            for(i=0;i<canvasElements.length;i++){
                                if(canvasElements[i].getAttribute('id') == view_id){
                                    canvasElements[i].setAttribute("id", new_viewid);
                                }
                            }

			    //alert(data.xml);
			    EMRView.canvas.setPreferences(data.xml,'true');
			}
			else{

			    $canvasXML.find("view[id='"+view_id+"']").text(new_viewname);
			    $canvasXML.find("view[id='"+view_id+"']").attr("id",new_viewid);
			    $canvasXML.find("canvas[id='"+view_id+"']").attr("id",new_viewid);
			
			    //alert($canvasXML.html());
			    EMRView.canvas.setPreferences($canvasXML.html(),'true');
			    $canvasXML.remove();
			    $('<dummy />').remove();
			}

                        $( this ).dialog( "close" );
			$("#newviewname").remove();

			EMRView.general.showNotice("Rename Successful.");
			EMRView.canvas.loadCanvas();
			}
			else{
			EMRView.general.showNotice("Must choose different name.");

			}
			$dialog.remove();
                    },
                    Cancel: function() {
                      $( this ).dialog( "close" );
                    }
                   }
                });
                $dialog.dialog('open');
                return false;


}

EMRView.views.deleteView = function(view_id){

        var data = EMRView.canvas.getPreferences();

        if(jQuery.browser.msie){
            viewElements = data.getElementsByTagName("view");
            for(i=0;i<viewElements.length;i++){
                if(viewElements[i].getAttribute('id') == view_id){
                    var old_viewname = viewElements[i].childNodes[0].nodeValue;
                    if(EMRViewDebugMode) alert("old_viewname=" + old_viewname);
                }
            }
        }
        else{
            var $canvasXML = $('<dummy />').append(data);
            var old_viewname = $canvasXML.find("view[id='"+view_id+"']").text();
        }


                var $dialog = $('<div></div>')
                .html("Are you sure you want to delete \""+old_viewname+"\"? This action cannot be undone.")
                .dialog({
                   autoOpen: false,
                   title: 'Delete View',
                   modal: true,
                   buttons: {
                    "Yes, Delete": function() {
//TODO
//find view id=view_id and canvas id=view_id, and remove both
			if(jQuery.browser.msie){
		            viewElements = data.getElementsByTagName("view");
		            for(i=0;i<viewElements.length;i++){
		                if(viewElements[i].getAttribute('id') == view_id){
	                            viewElements[i].parentNode.removeChild(viewElements[i]);
		                }
		            }
                            canvasElements = data.getElementsByTagName("canvas");
                            for(i=0;i<canvasElements.length;i++){
                                if(canvasElements[i].getAttribute('id') == view_id){
                                    canvasElements[i].parentNode.removeChild(canvasElements[i]);
                                }
                            }
			    alert('DELETED! ' + data.xml);

			    EMRView.canvas.setPreferences(data.xml,'true');
			}
			else{
                            $canvasXML.find("view[id='"+view_id+"']").remove();
                            $canvasXML.find("canvas[id='"+view_id+"']").remove();

                            //alert($canvasXML.html());
                            EMRView.canvas.setPreferences($canvasXML.html(),'true');
                            $canvasXML.remove();
                            $('<dummy />').remove();
			}
                        $( this ).dialog( "close" );

                        EMRView.general.showNotice("Delete Successful.");
                        EMRView.canvas.loadCanvas();

                        $dialog.remove();
                    },
                    Cancel: function() {
                      $( this ).dialog( "close" );
                    }
                   }
                });
                $dialog.dialog('open');
                return false;

}

EMRView.views.newView = function(){

        var data = EMRView.canvas.getPreferences();

                var $dialog = $('<div></div>')
                .html("New View Title: <input type='text' id='newviewname2' value='' />")
                .dialog({
                   autoOpen: false,
                   title: 'Create View',
                   modal: true,
                   buttons: {
                    "Create": function() {

                        var new_viewname = htmlEscape($('#newviewname2').val());
                        var new_viewid = $('#newviewname2').val().toLowerCase().replace(' ','-').replace(/[^A-Za-z\-]/g,"") + Math.floor(Math.random()*1000);
                        //alert('newviewname=' + new_viewname);


			if(jQuery.browser.msie){
			    newCanvasElement = data.createElement("canvas"); // <canvas>
			    newCanvasElement.setAttribute("id", new_viewid); // <canvas id="new_viewid">

			    newViewElement = data.createElement("view"); // <view>
			    newViewElement.setAttribute("id", new_viewid); // <view id="new_viewid">
			    newViewElement.appendChild(data.createTextNode(new_viewname)); // <view id="new_viewid">new_viewname</view>

			    newColumnElement = data.createElement("column"); // <column>

			    newCanvasElement.appendChild(newColumnElement);
			    newCanvasElement.appendChild(newColumnElement);

			    data.getElementsByTagName("emrview")[0].appendChild(newCanvasElement);
			    data.getElementsByTagName("view_set")[0].appendChild(newViewElement);

			    alert(data.xml);
			    EMRView.canvas.setPreferences(data.xml,'true');
			}
			else{
			    var $canvasXML = $('<dummy />').append(data);			
			    var viewXML = '   <view id="'+new_viewid+'">'+new_viewname+'</view>' + "\n";
			    var canvXML = '<canvas id="'+new_viewid+'">' + "\n";
			    canvXML += "   <column>\n";
			    canvXML += "   </column>\n";
                            canvXML += "   <column>\n";
                            canvXML += "   </column>\n";
			    canvXML += "</canvas>\n";

                            $canvasXML.find("view_set").append(viewXML);
			    $canvasXML.find("emrview").append(canvXML);
                            //alert($canvasXML.html());
                            EMRView.canvas.setPreferences($canvasXML.html(),'true');
			    $canvasXML.remove();
			    $('<dummy />').remove();

			}
                        $( this ).dialog( "close" );

			$('#newviewname2').remove();

                        EMRView.general.showNotice("Create New View Successful.");
                        EMRView.canvas.loadCanvas(new_viewid);

			EMRView.general.showNotice("Begin by adding a SMART app from the App Library.");

                        $dialog.remove();
                    },
                    Cancel: function() {
                      $( this ).dialog( "close" );
                    }
                   }
                });
                $dialog.dialog('open');
                return false;


}



EMRView.views.setDefaultCanvas = function(canvas_id){
//DEBUGIE
	var data = EMRView.canvas.getPreferences();
	EMRView.canvas.activeCanvasId = canvas_id;
	if(jQuery.browser.msie){
            $(data).find('view_set').each(function(){
                $(this).find('view').each( function(){
                    if($(this).attr('id') == canvas_id){ // found canvas_id
                        $(this).attr('default','true');
                    }
                    else{
                        $(this).removeAttr('default');
                    }
                });
            });
	    EMRView.canvas.setPreferences(data.xml,'true');
	}
	else{
    	    var $viewXML = $('<dummy />').append(data);
            $viewXML.find('view_set').each(function(){
		$(this).find('view').each( function(){
        	    if($(this).attr('id') == canvas_id){ // found canvas_id
			$(this).attr('default','true');
		    }
		    else{
			$(this).removeAttr('default');
		    }
		});
	    });
	    EMRView.canvas.setPreferences($viewXML.html(),'true');
	}

}


EMRView.canvas.saveCanvas = function(){
	var saveXML = "<canvas>\n";

	var col_list = jQuery('.column.ui-sortable');
        jQuery.each(col_list, function(){
		saveXML += "   <column>\n";
		var column_id = $(this).attr('id');
		var app_list = jQuery('#'+column_id +' .widget.widget-color.ui-emr-widget');
        	
		jQuery.each(app_list, function(){
			saveXML += "      <widget>\n";
			var app_widget_id = $(this).attr('id');
			var app_widget_array = app_widget_id.split('____');

			var app_id = getRealAppId(app_widget_array[0]);
			var app_height = $('#'+app_widget_id +' .widget-content.ui-state-disabled.ui-resizable').css('height');
		
//			alert(app_id + ' has height of ' + app_height + ' in column ' + column_id);
                        saveXML += "         <id>"+app_id+"</id>\n";
                        saveXML += "         <height>"+app_height+"</height>\n";
                        saveXML += "      </widget>\n";
        	});
		saveXML += "   </column>\n";
	});

	saveXML += "</canvas>";

	//parent.i2b2.SmartContainer.savePreferences(saveXML);
	EMRView.canvas.setPreferences(saveXML);
/*
                var $dialog = $('<div></div>')
                .html("<textarea rows='20' cols='80'>"+saveXML+"</textarea>")
                .dialog({
                   autoOpen: false,
		   width: 600,
                   title: 'Save Canvas',
                   modal: true,
                   buttons: {
                    "Save": function() {
                       $( this ).dialog( "close" );
                    },
                    Cancel: function() {
                      $( this ).dialog( "close" );
                    }
                   }
                });
                $dialog.dialog('open');
*/
//	alert(saveXML);
}

EMRView.canvas.viewColumns = function(col_nums, canvas_id){

	var col_list = jQuery('.column.ui-sortable');
	var app_list = jQuery('.widget.widget-color.ui-emr-widget');

	var num_columns = col_nums;
	var num_elements = app_list.length;

	if(col_list.length != col_nums){

		var num_in_each = Math.floor(num_elements / num_columns);
		var column_array = new Array(num_columns);
		var item_index = 0; 
//		var num_left_over_items = num_elements % num_in_each;
		var num_left_over_items = num_elements - (num_in_each * num_columns);
//		alert(num_left_over_items);

		for(var x=0;x<column_array.length;x++){
  			column_array[x] = app_list.slice(item_index, item_index+num_in_each+num_left_over_items);
			
	  		item_index = item_index+num_in_each+num_left_over_items;
			
			if(num_left_over_items){
    				num_left_over_items = 0;
  			}
		}

		var column_id = 1;

		jQuery.each(column_array, function(index,value){
	  		var column_html = $('<ul id="column'+column_id+'" class="column">').append(value);
  			$('#'+canvas_id).append(column_html);
			column_id++;
		});

		col_list.remove();

	}

        switch(col_nums){
                case 1:
                        jQuery('#column1').css('width', '90%');
	                $( "#columns .widget-content" ).css('width','100%').resizable({
					   handles: 's',
                       maxWidth: 1018,
                       minHeight: 60,
				disabled: true,
				start: function(event,ui){
	                        	EMRView.events.startSortableEvent();
	                	},
				stop: function(event,ui){
	                        	EMRView.events.stopSortableEvent();
	                	}
                	});
			EMRView.canvas.numOfColumns = 1;
                        break;
                case 2:
                        jQuery('#column1').css('width', '45%');
                        jQuery('#column2').css('width', '45%');
	                $( "#columns .widget-content" ).css('width','100%').resizable({
                        handles: 's',
                        maxWidth: 509,
                        minHeight: 60,
				disabled: true,
				start: function(event,ui){
	                        	EMRView.events.startSortableEvent();
	                	},
				stop: function(event,ui){
	                        	EMRView.events.stopSortableEvent();
	                	}
                	});
			EMRView.canvas.numOfColumns = 2;
                        break;
                case 3:
                        jQuery('#column1').css('width', '30%');
                        jQuery('#column2').css('width', '30%');
                        jQuery('#column3').css('width', '30%');
	                $( "#columns .widget-content" ).css('width','100%').resizable({
                        handles: 's',
                        maxWidth: 339,
                        minHeight: 60,
				disabled: true,
				start: function(event,ui){
	                        	EMRView.events.startSortableEvent();
	                	},
				stop: function(event,ui){
	                        	EMRView.events.stopSortableEvent();
	                	}
	                });
			EMRView.canvas.numOfColumns = 3;
                        break;
        }

                $( ".column" ).sortable({
                        connectWith: ".column",
                        items: "li:not(.ui-state-disabled)",
                        cancel: ".ui-state-disabled",
			disabled: true,
			start: function(event,ui){
                        	EMRView.events.startSortableEvent();
                	},
			stop: function(event,ui){
                        	EMRView.events.stopSortableEvent();
                	}
                }).disableSelection();

                if(EMRView.general.editMode){
                    $(".column").sortable("option", "disabled", false);
					$(".widget-head").css("cursor", "move");
	                $(".widget-content").resizable("option", "disabled", false);
        			$(".column").sortable("option", "handle", ".widget-head");

                }



}


EMRView.canvas.createColumns = function(col_nums, canvas_id){
// col_nums = 1, 2, or 3
// use CASE/switch
	switch(col_nums){
		case 1:	
			jQuery("#"+canvas_id).append($("<ul id='column1'></ul>").addClass("column"));
			jQuery('#column1').css('width', '90%');
			break;
		case 2:
                        jQuery("#"+canvas_id).append($("<ul id='column1'></ul>").addClass("column"));
                        jQuery("#"+canvas_id).append($("<ul id='column2'></ul>").addClass("column"));
                        jQuery('#column1').css('width', '45%');
                        jQuery('#column2').css('width', '45%');
			break;
		case 3:
                        jQuery("#"+canvas_id).append($("<ul id='column1'></ul>").addClass("column"));
                        jQuery("#"+canvas_id).append($("<ul id='column2'></ul>").addClass("column"));
                        jQuery("#"+canvas_id).append($("<ul id='column3'></ul>").addClass("column"));
                        jQuery('#column1').css('width', '30%');
                        jQuery('#column2').css('width', '30%');
                        jQuery('#column3').css('width', '30%');
			break;
	}

                $( ".column" ).sortable({
                        connectWith: ".column",
                        items: "li:not(.ui-state-disabled)",
                        cancel: ".ui-state-disabled",
			disabled: true,
			start: function(event,ui){
                        	EMRView.events.startSortableEvent();
                	},
			stop: function(event,ui){
                        	EMRView.events.stopSortableEvent();
                	}
                }).disableSelection();

		if(EMRView.general.editMode){
			$(".column").sortable("option", "disabled", false);
			$(".widget-head").css("cursor", "move");
			$(".column").sortable("option", "handle", ".widget-head");
			
		}


}

EMRView.canvas.removeColumns = function(canvas_id){
	jQuery("#"+canvas_id).empty();
}

EMRView.canvas.getPreferences = function(){
	if(EMRViewDebugMode) alert('getPreferences()');
        if(jQuery.browser.msie){
            xmlDoc=new ActiveXObject("Microsoft.XMLDOM");
            xmlDoc.async = "false";
            if(EMRView.canvas.preferences == '' || EMRView.canvas.preferences == undefined){
                xmlDoc.loadXML(EMRView.general.getDefaultXML());
            }
	    else{
		xmlDoc.loadXML(EMRView.canvas.preferences);
	    }
	    return xmlDoc;
        }
	else{
	    if(EMRView.canvas.preferences == '' || EMRView.canvas.preferences == undefined){
	        return EMRView.general.getDefaultXML();
	    }
	    return EMRView.canvas.preferences;

	}
}

EMRView.canvas.setPreferences = function(preferences, quiet){
	//parent.i2b2.SmartContainer.savePreferences(preferences,quiet);
	//SMART.PREFERENCES_put(preferences, 'text', function(prefpayload) {
    SMART.put_user_preferences({
	data: preferences,
	contentType: 'text'
    }).success(function(prefpayload) {
		
		if(!quiet) EMRView.general.showNotice('Preferences Saved');
		//alert('setPreferences() success inside emrview');
    });
	EMRView.canvas.preferences = preferences;
}

EMRView.canvas.getManifests = function(){
	return EMRView.canvas.manifests;
}


EMRView.general.init = function(){
//startup

	$('#link_edit_mode').click(function(){
                var $dialog = $('<div></div>')
                .html("<img src='assets/img/edit.png' align='left' style='padding-right:5px'>You are about to enter <strong>Edit Mode</strong> where you can add/remove SMART apps, customize your EMR View canvas, and create new views.<br/><br/>Are you sure you want to proceed?")
                .dialog({
                   autoOpen: false,
                   title: 'Confirm Edit Mode',
                   modal: true,
		   width: 350,
                   buttons: {
                    "Yes, Proceed": function() {
			EMRView.general.loadEditMode();
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
$( "input:button").button();

        $container = $("#emrview-notices").notify();

        $( "#emrview-views" ).sortable({
                axis: "y",
                placeholder: "ui-state-highlight",
                handle: "img",
                stop: function(event,ui){
                        EMRView.views.saveViewList();
                },
		disabled: true
        });

}

EMRView.general.loadEditMode = function(){

	EMRView.general.editMode = true;
	EMRView.plugin.initCarousel(EMRView.canvas.manifests);
	EMRView.plugin.initAllApps(EMRView.canvas.manifests);

//	$("#button_normal_mode").show();
	$("#emrview-new-view").show();
	$(".tooltip-default").tooltip();
	
	$( "#columns .widget-content" ).resizable( "option", "disabled", false );
	$("a.close").show();
	$(".widget-foot").show();
	$("a.zoom").hide();

	$("#emrview-view-save").show();
	$("#emrview-view-columns").show();
	$("#emrview-view-controls").show("slide", {direction: "right"}, 1000);

    $( ".column" ).sortable("option", "disabled", false);
	$(".widget-head").css("cursor", "move"); //default
	$(".column").sortable("option", "handle", ".widget-head");

	$("#emrview-views span").show();

	$( "#emrview-views" ).sortable("option", "disabled", false);

        $( "#sortable" ).disableSelection();
	
}

EMRView.general.loadNormalMode = function(){
		//EMRView.canvas.currentCanvas();
        EMRView.general.editMode = false;
		EMRView.plugin.hideCarousel();

//        $("#button_normal_mode").hide();
        $("#emrview-new-view").hide();
//        $(".tooltip-default").tooltip();

        $( "#columns .widget-content" ).resizable( "option", "disabled", true );
        $("a.close").hide();
		$(".widget-foot").hide();
        $("a.zoom").show();

        $("#emrview-view-save").hide();
        $("#emrview-view-columns").hide();

        $( ".column" ).sortable("option", "disabled", true);
        $(".widget-head").css("cursor", "default"); //default

        $("#emrview-views span").hide();

        $( "#emrview-views" ).sortable( "option", "disabled", true);
        $( "#sortable" ).disableSelection();

	$("#emrview-view-controls").hide("slide", {direction: "right"}, 1000, function(){
		EMRView.canvas.loadCanvas();
	});

}


EMRView.general.getDefaultXML = function(){

	var emrviewXML;

	emrviewXML =  "<emrview>\n";
	emrviewXML += "<view_set>\n";
	emrviewXML += "   <view id=\"medications\" default=\"true\">Medications</a>\n";
        emrviewXML += "</view_set>\n";
        emrviewXML += "<canvas id=\"medications\">\n";
        emrviewXML += "   <column>\n";
        emrviewXML += "      <widget>\n";
        emrviewXML += "         <id>med-list@apps.smartplatforms.org</id>\n";
        emrviewXML += "         <height>270px</height>\n";
        emrviewXML += "      </widget>\n";
        emrviewXML += "      <widget>\n";
        emrviewXML += "         <id>got-claritin@apps.smartplatforms.org</id>\n";
        emrviewXML += "         <height>60px</height>\n";
        emrviewXML += "      </widget>\n";
        emrviewXML += "   </column>\n";
        emrviewXML += "   <column>\n";
        emrviewXML += "      <widget>\n";
        emrviewXML += "         <id>problem-list@apps.smartplatforms.org</id>\n";
        emrviewXML += "         <height>270px</height>\n";
        emrviewXML += "      </widget>\n";
        emrviewXML += "      <widget>\n";
        emrviewXML += "         <id>mini-statins@apps.smartplatforms.org</id>\n";
        emrviewXML += "         <height>60px</height>\n";
        emrviewXML += "      </widget>\n";
        emrviewXML += "   </column>\n";
        emrviewXML += "</canvas>\n";
        emrviewXML += "</emrview>";

	return emrviewXML;

}

EMRView.general.showNotice = function( text, opts ){
	return $container.notify("create", "emrview-notice", { text: text }, opts);
}

function parseXml(xml)
{
    if (jQuery.browser.msie)
    {
        var xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
        xmlDoc.loadXML(xml);
        xml = xmlDoc;
    }
    return xml;
}

function htmlEscape(str) {
    return String(str)
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
}

function getNormalizedAppId(real_app_id){
	var norm_app_id = real_app_id.toLowerCase();
        norm_app_id = norm_app_id.replace('@','___');
        norm_app_id = norm_app_id.replace(/\./g,'__');

	return norm_app_id;
}

function getRealAppId(norm_app_id){
	var real_app_id = norm_app_id.toLowerCase();
	real_app_id = real_app_id.replace(/___/g,'@');
	real_app_id = real_app_id.replace(/__/g,'.');

	return real_app_id;
}

function createAppWidgetId(app_id){
	var app_widget_id = getNormalizedAppId(app_id) + '____' + guidGenerator();	

	return app_widget_id;
}


function guidGenerator() {
    var S4 = function() {
       return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    };
    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}

function goFullscreen(id) {
    // Get the element that we want to take into fullscreen mode
    var element = document.getElementById(id);
    
    // These function will not exist in the browsers that don't support fullscreen mode yet, 
    // so we'll have to check to see if they're available before calling them.
    alert('before');
    if (element.mozRequestFullScreen) {
      // This is how to go into fullscren mode in Firefox
      // Note the "moz" prefix, which is short for Mozilla.
      element.mozRequestFullScreen();
	alert('moz');
    } else if (element.webkitRequestFullScreen) {
      // This is how to go into fullscreen mode in Chrome and Safari
      // Both of those browsers are based on the Webkit project, hence the same prefix.
      element.webkitRequestFullScreen();
	alert('webkit');
   }
   alert('after');
   // Hooray, now we're in fullscreen mode!
}
