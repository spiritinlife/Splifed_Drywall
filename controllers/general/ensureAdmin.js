'use strict';

module.exports = {
	method : "all",
	url : ["/account*","/admin*"],
	desc : "all others : ensureAccount on /account* ",
	passport : null,
	handler : function(req, res, next) {
		if (req.user.canPlayRoleOf('admin')) {
			return next();
		}
		res.redirect('/');
	}
};