
'use strict';

module.exports = {
	method : "GET",
	url : ["/account/settings/google/disconnect/"],
	desc : "get : account settings google disconnectGoogle",
	passport : null,
	handler :  function(req, res, next){
		req.app.db.models.User.findByIdAndUpdate(req.user.id, { google: { id: undefined } }, function(err, user) {
			if (err) {
				return next(err);
			}

			res.redirect('/account/settings/');
		});
	}
};


