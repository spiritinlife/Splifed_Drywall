'use strict';
var helpers = require('./helpers');

module.exports = {
	method : "GET",
	url : ["/account/settings/twitter/"],
	desc : "get : account settings twitter connectTwitter",
	passport : {
		strategy : 'twitter',
		callbackURL : "/account/settings/twitter/callback/"
	},
	handler : function(req, res, next){
		req._passport.instance.authenticate('twitter', function(err, user, info) {
			if (!info || !info.profile) {
				return res.redirect('/account/settings/');
			}

			req.app.db.models.User.findOne({ 'twitter.id': info.profile.id, _id: { $ne: req.user.id } }, function(err, user) {
				if (err) {
					return next(err);
				}

				if (user) {
					helpers.renderSettings(req, res, next, 'Another user has already connected with that Twitter account.');
				}
				else {
					req.app.db.models.User.findByIdAndUpdate(req.user.id, { 'twitter.id': info.profile.id }, function(err, user) {
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