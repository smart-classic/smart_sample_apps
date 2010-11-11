jQuery.Controller.extend('ApiPlayground.Controllers.MainController',
/* @Static */
{
	onDocument : true
},
/* @Prototype */
{
	load : function() {
		this.calls = {};
		this.payload_box = $("#payload");
		this.response_box = $("#response");
		this.payload_box.hide();
		this.response_box.hide();
		
		var ORIGIN = null, FRAME = window.top;
	
		SMART = new SMART_CLIENT(ORIGIN, FRAME);
		var _this = this;
			
		SMART.send_ready_message(function(user_and_record_context) {
			
			ApiType.interpolations.record_id = user_and_record_context.record.id;
			ApiType.addInterpolationValue("record_id", user_and_record_context.record.id);
						
			SMART.ONTOLOGY_get(function(ont) {
				var types = ont.where("?cls api:call ?call")				
				   			   .where("?cls api:name ?n")			
			   				   .where("?cls api:example ?e")
							   .where("?call api:path ?p")
							   .where("?call api:target ?t")
							   .where("?call api:method ?m");
				
				for (var i = 0; i < types.length; i++) {
					var c = ApiCall.get_or_create(types[i]);
					
					var t = ApiType.get_or_create(types[i]);					
					t.addCall(c);					
				}
				
				var types = [];				
				$.each(ApiType.types, function(i, type) {types.push(type);});
				console.log("available types", types.length);
				$("#type-nav").html(_this.view('types', {types: types}));				
				$("#wrap").css({marginLeft: $("#type-nav").width()});
			});
		});
    },
    
    ".type click": function(el, ev ){
		var t = el.closest(".type").model();
		this.selected_type = t;
		t.element = el;
		t.fetchParameters();
		
		$("#type-heading").html(this.view('calls', {type: t}));
		console.log("chose type " + t.name);
		this.payload_box.hide();
		this.response_box.hide();
		this.response_box.html("");
		$("#interpolation-fields").html("");
    },
    
    ".call BUTTON click": function(el, ev)
    {
		var c = el.closest(".call").model();
		this.selected_call = c;
		this.selected_method = el.text();
		
		console.log("chose "+el.text()+" call " + c.targets.join(", ")  + c.type.example);

		var method = el.text();
		if ($.inArray(method, c.Class.payload_methods) !== -1)
		{
			this.payload_box.val(c.type.example);	
			this.payload_box.show();	
		} else  {
			this.payload_box.val("");
			this.payload_box.hide();
		}

		this.response_box.hide();
		this.response_box.html("");
		
		$("#interpolation-fields").html(this.view('interpolations', {type: this.selected_type, 
																	 call: this.selected_call,
																	 method: this.selected_method}));
		
		$("#interpolation-fields INPUT").each(function() {
			$i = $(this);
			var field_name = $i.attr("field_name");
			
			var compfunc = function(request, response) {
				try {
				console.log("looking up " + field_name + ": " + ApiType.interpolations.lists[field_name].join(", "));
				response(ApiType.interpolations.lists[field_name]);
				} catch(err) {response([]);}
			};
			
			$i.autocomplete(
				{source: compfunc,
				 minLength: 0, 
				 delay: 0,
				 close: function() {$(this).data("close_handled", false);}})
				.focus(function () {					
				 		var close_handled = $(this).data("close_handled");
						if (close_handled) {
						   $(this).keydown(); 
						}					
				 		$(this).data("close_handled", true);					
				}).data("close_handled", true);
			try  {$i.val(ApiType.interpolations.lists[field_name][0]);} catch(err){}
			
		});
    },

    "BUTTON.cancel-call click": function(el, ev) {
    	this.selected_type.element.click();
    
    },
    
    "BUTTON.complete-call click": function(el, ev) {
    	$(".cancel-call").attr("DISABLED", "true");
		$(".complete-call").attr("DISABLED", "true");
	
    	$("#interpolation-fields INPUT").each(function() {
			$i = $(this);
			var field_name = $i.attr("field_name");    		
    		ApiType.interpolations[field_name] = $i.val();
    	});
    	
    	this.selected_call.callAPI(this.selected_method, 
    								this.payload_box.val(), 
    								this.callback(this.receivedResult))
    },
    
    receivedResult: function(contentType, data) {
    	
    	console.log("got data" + contentType + data);
    	this.response_box.text("Response:\n\n"+data);
		this.response_box.html(this.response_box.html()
				.replace(/\n/g, "<br>"));
    	this.response_box.show();
		$(".cancel-call").remove();
		$(".complete-call").text("Done");

    }
    
});