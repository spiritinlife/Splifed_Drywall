'use strict';


/* This module will setup the routes */
var fs = require('fs');

var Routes = {};
Routes.routes = {};
Routes.all_method_routes = [] ;  //routes that respond to all methods neeed to be taken with special care (u need to add them last)



Routes.init = function (app,passport){
	Routes.app = app;
	Routes.passport = passport;
	
	if (app.development){
		Routes.RouteInfoClass = require('./dev/routesInfo');
	}
  //DEVELOPMENT ONLY SPECIAL ROUTES
  //TO-do figure out whu it has to b jere and not under line 61!!!!!
  if (app.development){


    //Insert /all/dev/ to your browser and you get all routes with descriptions
    app.get("/all/dev/",function(req,res){
      var rts = [];

      Object.keys(Routes.routes).forEach(function(route){
        rts.push(Routes.routes[route].toJade());
      });
      res.render("../configurator/dev/routesInfo",{routes : rts});      
    });
    
    //Insert /dev/ to every drywall url on the browser and you get descriptions about the route
    app.get("*/dev/",function(req,res){
      var regex = new RegExp("(.*?)dev");
      var uri =  regex.exec(req.path);
      //uri should like this
      //[ '/something/dev', '/something/', index: 0, input: '/something/dev' ] as we have one capture group
      var route = Routes.routes[uri[1]];
      if (route === undefined || route === null || route === ''){
        res.send("<h1>No such route " + uri[1] + "<h1>");
      }
      else{
        res.render("../configurator/dev/routesInfo",{routes : [route.toJade()]});
      }
    });



	folderTraverse(__dirname+"/../controllers");
		
	
	//Special care for routes that are defined by all methods --need to be defined at last
	for(var i = Routes.all_method_routes.length -1 ; i>=0; i--){
		for(var j = Routes.all_method_routes[i].url.length -1 ; j>=0; j--){
			var url = Routes.all_method_routes[i].url[j];
			app.all(Routes.all_method_routes[i].url[j],	Routes.all_method_routes[i].handler);
		}
	}
	
	
	
	
	}
}


Routes.table = function(){
	console.log("-------------------Routes/Controllers Table (Start)-----------------------------");
	for (var i = Routes.routes.length - 1; i >= 0; i--) {
	//	console.log(Routes.routes[i]);
	};	
	console.log("-------------------Routes/Controllers Table (End)-------------------------------");
}



function folderTraverse(folder){
	var files = fs.readdirSync(folder);
	files.forEach(function(file){
		var stat = fs.statSync(folder+"/"+file);
		if(stat.isDirectory()){
			folderTraverse(folder+"/"+file);
		}else{
			if ( file.indexOf(".js") != -1 && file !== "helpers.js"){
				var controller = require(folder+"/"+file);
				defineRoute(Routes.app,Routes.passport,controller,folder+"/"+file);
			}
		}
	});	
}

function defineRoute(app,passport,controller,filepath){


	if (controller.method === "all" ){
		Routes.all_method_routes.push(controller);
	}

	if (controller.passport === null)
	{
		
		
		for(var i = controller.url.length -1 ; i>=0; i--){
			var url = controller.url[i];

      if (app.development){
        Routes.routes[url] = new Routes.RouteInfoClass(controller,filepath);
			}

			if (controller.method === "POST")
				app.post( url, controller.handler );
			else if (controller.method === "GET")
				app.get( url , controller.handler );
			else if (controller.method === "PUT")
				app.put( url , controller.handler );
			else if (controller.method === "DELETE")
				app.delete( url , controller.handler );
		}
	}
	else if (controller.passport != undefined && controller.passport != null)
	{
		
      if (app.development){
        Routes.routes[url] = new Routes.RouteInfoClass(controller,filepath);
        Routes.routes[controller.passport.callbackURL] = new Routes.RouteInfoClass(controller,filepath);
      }


		if (controller.method === "POST"){
			app.post( controller.url, passport.authenticate(controller.passport.strategy,{ callbackURL : controller.passport.callbackURL}));
			app.post( controller.passport.callbackURL, controller.handler );
		}
		else if (controller.method === "GET"){
			app.get( controller.url, passport.authenticate(controller.passport.strategy,{ callbackURL : controller.passport.callbackURL}), controller.handler );
			app.get( controller.passport.callbackURL, controller.handler );
		}
		else if (controller.method === "PUT"){
			app.put( controller.url, passport.authenticate(controller.passport.strategy,{ callbackURL : controller.passport.callbackURL}), controller.handler );				
			app.put( controller.passport.callbackURL, controller.handler );
		}
		else if (controller.method === "DELETE"){
			app.delete( controller.url, passport.authenticate(controller.passport.strategy,{ callbackURL : controller.passport.callbackURL}), controller.handler );				
			app.delete( controller.passport.callbackURL, controller.handler );
		}
	}
}

module.exports = Routes;