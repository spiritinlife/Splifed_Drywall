
var RouteInfo = function(controller,filepath){
	this.method = controller.method;
	this.url = controller.url;
	this.desc = controller.desc;
	this.filepath = filepath;
	this.passport = controller.passport;
}

RouteInfo.prototype.toConsole = function(){
	console.log("app."+this.method+"-> "+ this.url + "\n	->handler from file " + this.filepath);
}
RouteInfo.prototype.toJade = function(){
	return { method : this.method,
					 url    : this.url,
					 desc   : this.desc,
					 passport : this.passport,
					 filepath : this.filepath
				 };
}


module.exports = RouteInfo;