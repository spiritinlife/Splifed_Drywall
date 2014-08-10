
'use strict';

module.exports = {
	method : "GET",
	url : ["/account/settings/twitter/disconnect/"],
	desc : "get : account settings twitter disconnectTwitter",
	passport : null,
	handler : function(req, res, next){
		req.app.db.models.User.findByIdAndUpdate(req.user.id, { twitter: { id: undefined } }, function(err, user) {
			if (err) {
				return next(err);
			}

			res.redirect('/account/settings/');
		});
	}
};