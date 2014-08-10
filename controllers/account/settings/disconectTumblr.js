
'use strict';

module.exports = {
	method : "GET",
	url : ["/account/settings/tumblr/disconnect/"],
	desc : "get : account settings tumblr disconnectTumblr",
	passport : null,
	handler :  function(req, res, next){
		req.app.db.models.User.findByIdAndUpdate(req.user.id, { tumblr: { id: undefined } }, function(err, user) {
			if (err) {
				return next(err);
			}

			res.redirect('/account/settings/');
		});
	}
};