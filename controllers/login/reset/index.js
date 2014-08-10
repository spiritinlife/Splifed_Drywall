'use strict';


module.exports = {
	method : "GET",
	url : ["/login/reset","/login/reset/:email/:token"],
	desc : "get : login reset ['/login/reset','/login/reset/:email/:token'] ",
	passport : null,
	handler : function(req, res){
		if (req.isAuthenticated()) {
			res.redirect(req.user.defaultReturnUrl());
		}
		else {
			res.render('login/reset/index');
		}
	}
};