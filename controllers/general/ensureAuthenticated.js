'use strict';

module.exports = {
	method : "all",
	url : ["/account*","/admin*"],
	desc : "all others : ensureAccount on /account* ",
	passport : null,
	handler : function(req, res, next) {
		if (req.isAuthenticated()) {
			return next();
		}
		res.set('X-Auth-Required', 'true');
		req.session.returnUrl = req.originalUrl;
		res.redirect('/login/');
	}
};