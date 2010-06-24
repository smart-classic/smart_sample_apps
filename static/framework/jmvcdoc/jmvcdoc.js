steal.plugins('jquery/controller','jquery/controller/history',
			  'jquery/view/ejs',
			  'jquery/model',
			  'jquery/lang/json',
			  'jquery/dom/cookie',
			  
			  'phui/filler',
			  'phui/positionable',
			  'phui/menuable')
     .resources(//'jsonp',
	 			'highlight','languages/javascript','languages/www')
     .models('favorites','search')
     .controllers("documentation","iframe","demo")
     .views('//jmvcdoc/views/attribute.ejs',
	 	    '//jmvcdoc/views/class.ejs',
			'//jmvcdoc/views/constructor.ejs',
			'//jmvcdoc/views/favorite.ejs',
			'//jmvcdoc/views/function.ejs',
			'//jmvcdoc/views/page.ejs',
			'//jmvcdoc/views/results.ejs',
			'//jmvcdoc/views/top.ejs',
			'//jmvcdoc/views/iframe/init.ejs',
			'//jmvcdoc/views/iframe/menu.ejs',
			'//jmvcdoc/views/demo/init.ejs')
	.then(function(){

	})
