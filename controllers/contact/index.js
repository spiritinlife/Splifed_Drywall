'use strict';

module.exports = {
	method : "GET",
	url : ["/contact/"],
	desc : "get : front end contact",
	passport : null,
	handler : function(req, res){
		res.render('contact/index');
	}
};