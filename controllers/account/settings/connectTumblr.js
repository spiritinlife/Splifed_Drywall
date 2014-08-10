'use strict';
var helpers = require('./helpers');

module.exports = {
	method : "GET",
	url : ["/account/settings/tumblr/"],
	desc : "get : account settings tumblr connectTumblr",
	passport : {
		strategy : 'tumblr',
		callbackURL : "/account/settings/tumblr/callback/"
	},
	handler :  function(req, res, next){
		req._passport.instance.authenticate('tumblr', { callbackURL: '/account/settings/tumblr/callback/' }, function(err, user, info) {
			if (!info || !info.profile) {
				return res.redirect('/account/settings/');
			}

			if (!info.profile.hasOwnProperty('id')) {
				info.profile.id = info.profile.username;
			}

			req.app.db.models.User.findOne({ 'tumblr.id': info.profile.id, _id: { $ne: req.user.id } }, function(err, user) {
				if (err) {
					return next(err);
				}

				if (user) {
					helpers.renderSettings(req, res, next, 'Another user has already connected with that Tumblr account.');
				}
				else {
					req.app.db.models.User.findByIdAndUpdate(req.user.id, { 'tumblr.id': info.profile.id }, function(err, user) {
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