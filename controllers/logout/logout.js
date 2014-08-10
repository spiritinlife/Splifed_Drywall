'use strict';

module.exports = {
	method : "GET",
	url : ["/logout/"],
	desc : "get : logout",
	passport : null,
	handler : function(req, res){
		req.logout();
		res.redirect('/');
	}
};