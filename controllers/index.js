'use strict';

module.exports = {
	method : "GET",
	url : ["/"],
	desc : "homepage",
	passport : null,
	handler : function(req, res){
  	res.render('index');
	}
};
