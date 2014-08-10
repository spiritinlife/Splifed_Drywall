'use strict';
var helpers = require('./helpers');

module.exports = {
	method : "GET",
	url : ["/account/settings/google/"],
	desc : "get : account settings google connectGoogle",
	passport : {
		strategy : 'google',
		callbackURL : "/account/settings/google/callback/"
	},
	handler : function(req, res, next){
		req._passport.instance.authenticate('google', { callbackURL: '/account/settings/google/callback/' }, function(err, user, info) {
			if (!info || !info.profile) {
				return res.redirect('/account/settings/');
			}

			req.app.db.models.User.findOne({ 'google.id': info.profile.id, _id: { $ne: req.user.id } }, function(err, user) {
				if (err) {
					return next(err);
				}

				if (user) {
					helpers.renderSettings(req, res, next, 'Another user has already connected with that Google account.');
				}
				else {
					req.app.db.models.User.findByIdAndUpdate(req.user.id, { 'google.id': info.profile.id }, function(err, user) {
						if (err) {
							return next(err);
						}

						res.redirect('/account/settings/');
					});
				}
			});
		})(req, res, next);
	}
};
