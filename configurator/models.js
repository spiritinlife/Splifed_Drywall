//index.js
//Used to create the models from the schemas folder

'use strict'

var fs = require('fs');

var Models = {};
Models.schemas = [];


Models.init = function(app,mongoose){
	fs
	.readdirSync(__dirname+"/../models"+"/schemas")
	.forEach(function(file){
		var Schema = require(__dirname+"/../models"+"/schemas/"+file);
		var model = new Schema(app,mongoose);
		Models.schemas.push(model);
  		app.db.model(model.modelName, model.schema);
	});
}

  
Models.table = function(){
	console.log("-------------------------Schemas Table (Start)----------------------------------");
	for (var i = Models.schemas.length - 1; i >= 0; i--) {
		var model = Models.schemas[i];
		console.log(i+": Schema: "+model.modelName+" : "+model.modelDesc);
	};	
	console.log("-------------------------Schemas Table (End)------------------------------------");

}


module.exports = Models;