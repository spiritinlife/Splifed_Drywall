'use strict';


module.exports = {
	method : "GET",
	url : ["/login/forgot/"],
	desc : "get  : login forgot",
	passport : null,
	handler : function(req, res){
		if (req.isAuthenticated()) {
			res.redirect(req.user.defaultReturnUrl());
		}
		else {
			res.render('login/forgot/index');
		}
	}
};
