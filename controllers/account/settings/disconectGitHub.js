
'use strict';

module.exports = {
	method : "GET",
	url : ["/account/settings/github/disconnect/"],
	desc : "get : account settings twitter disconnectGithub",
	passport : null,
	handler : function(req, res, next){
		req.app.db.models.User.findByIdAndUpdate(req.user.id, { github: { id: undefined } }, function(err, user) {
			if (err) {
				return next(err);
			}

			res.redirect('/account/settings/');
		});
	}
};
