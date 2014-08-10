'use strict';
var helpers = require('./helpers');

module.exports = {
	method : "GET",
	url : ["/account/settings/github/"],
	desc : "get : account settings github connectGithub",
	passport : {
		strategy : 'github',
		callbackURL : "/account/settings/github/callback/"
	},
	handler : function(req, res, next){
		req._passport.instance.authenticate('github', function(err, user, info) {
			if (!info || !info.profile) {
				return res.redirect('/account/settings/');
			}

			req.app.db.models.User.findOne({ 'github.id': info.profile.id, _id: { $ne: req.user.id } }, function(err, user) {
				if (err) {
					return next(err);
				}

				if (user) {
					helpers.renderSettings(req, res, next, 'Another user has already connected with that GitHub account.');
				}
				else {
					req.app.db.models.User.findByIdAndUpdate(req.user.id, { 'github.id': info.profile.id }, function(err, user) {
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
