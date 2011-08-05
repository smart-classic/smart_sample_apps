jQuery.Controller.extend('ApiPlayground.Controllers.MainController',
/* @Static */
{
	onDocument : true
},
/* @Prototype */
{
	"{window} load" : function() {	
	    var _this = this;
	    SMART.ready(function() {
		console.log("SMART api playgroudn loading");
		_this.calls = {};
		_this.payload_box = $("#payload");
		_this.response_box = $("#response");

		_this.payload_box.hide();
		_this.response_box.hide();
		ApiType.interpolations.record_id = SMART.record.id;
		ApiType.addInterpolationValue("record_id", SMART.record.id);
		ApiType.find_all_types_and_calls();
		console.log("loaded");
	    });
    },
    
    'ontology_parsed subscribe': function(topic, element) {
		$("#type-nav").html(this.view('groups', {groups: ApiCallGroup.get_top_groups()}));

    }, 

    ".type click": function(el, ev ){
		var g = el.closest(".type").model();
		this.selected_top_group = g;
		g.element = el;
		
		$("#type-heading").html(this.view('calls', {group: g}));
		this.payload_box.hide();
		this.response_box.hide();
		$("#interpolation-fields").html("");
		g.group_type.fetchParameters();

    },
    
    "BUTTON.call click": function(el, ev)
    {

    	var c = el.closest(".call").model();
		this.selected_call = c;
		var method = c.method;
		
		if ($.inArray(method, ApiCall.payload_methods) !== -1)
		{
		    if (c.example !== undefined)
			this.payload_box.val(c.example);	
		    else
			this.payload_box.val(this.selected_top_group.group_type.example);	
		    this.payload_box.show();	
		} else  {
			this.payload_box.val("");
			this.payload_box.hide();
		}

		this.response_box.hide();
		
		$("#interpolation-fields").html(this.view('interpolations', {type: this.selected_top_group.group_type, 
																	 call: this.selected_call}));
		$("#interpolation-fields INPUT").each(function() {
			$i = $(this);
			var field_name = $i.attr("field_name");
			
			var compfunc = function(request, response) {
				try {
				//console.log("looking up " + field_name + ": " + ApiType.interpolations.lists[field_name].join(", "));
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
    	this.selected_top_group.element.click();
    
    },
    
    "BUTTON.complete-call click": function(el, ev) {
    	$(".cancel-call").attr("DISABLED", "true");
		$(".complete-call").attr("DISABLED", "true");

    	$("#interpolation-fields INPUT").each(function() {
			$i = $(this);
			var field_name = $i.attr("field_name");    		
    		ApiType.interpolations[field_name] = $i.val();
    		$i.attr("DISABLED", "true");
    	});
    	
    	this.selected_call.callAPI( this.payload_box.val(), 
    								this.callback(this.receivedResult))
    },
    
    receivedResult: function(contentType, data) {
	r = SMART.process_rdf(contentType, data);
    	//console.log("got data" + contentType + data);
	window.response = r;

	window.SMART_OBJECTS = window.SMART_OBJECTS || new smart_parser.Collection();
	SMART_OBJECTS.parse_rdf_payload(r);

    	this.response_box.show();
	$("#output").html("");
	postJSConsole(':help', true);

	
	var sample_command = "SMART_OBJECTS.by_type('"+ApiType.find_type(this.selected_call.target).name+"')";
	postJSConsole(sample_command);

	$("#exec").val(sample_command);
    	$(".cancel-call").removeAttr("DISABLED");
	$(".complete-call").removeAttr("DISABLED");
    	$("#interpolation-fields INPUT").each(function() {
	    $i = $(this);
    		$i.removeAttr("DISABLED");
    	});
	$("#exec").focus();
    	this.selected_top_group.group_type.fetchParameters();		
    }
    
});