'use strict';

module.exports = {
	method : "GET",
	url : ["/account/settings/facebook/disconnect/"],
	desc : "get : account settings twitter disconnectFacebook",
	passport : null,
	handler :  function(req, res, next){
		req.app.db.models.User.findByIdAndUpdate(req.user.id, { facebook: { id: undefined } }, function(err, user) {
			if (err) {
				return next(err);
			}

			res.redirect('/account/settings/');
		});
	}
};
