'use strict';


module.exports = {
	method : "GET",
	url : ["/about/"],
	desc : "get : front end - about",
	passport : null,
	handler : function(req, res){
  	res.render('about/index');
	}
};
