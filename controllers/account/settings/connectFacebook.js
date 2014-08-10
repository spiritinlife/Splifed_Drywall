'use strict';
var helpers = require('./helpers');

module.exports = {
	method : "GET",
	url : ["/account/settings/facebook/"],
	desc : "get : account settings facebook connectFacebook",
	passport : {
		strategy : 'facebook',
		callbackURL : "/account/settings/facebook/callback/"
	},
	handler : function(req, res, next){
		req._passport.instance.authenticate('facebook', { callbackURL: '/account/settings/facebook/callback/' }, function(err, user, info) {
			if (!info || !info.profile) {
				return res.redirect('/account/settings/');
			}

			req.app.db.models.User.findOne({ 'facebook.id': info.profile.id, _id: { $ne: req.user.id } }, function(err, user) {
				if (err) {
					return next(err);
				}

				if (user) {
					helpers.renderSettings(req, res, next, 'Another user has already connected with that Facebook account.');
				}
				else {
					req.app.db.models.User.findByIdAndUpdate(req.user.id, { 'facebook.id': info.profile.id }, function(err, user) {
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
