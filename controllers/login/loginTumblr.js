'use strict';

var helpers = require('./helpers');

module.exports = {
	method : "GET",
	url : ["/login/tumblr/"],
	desc : "get : social login - tumblr",
	passport : {
		strategy : 'tumblr',
		callbackURL : "/login/tumblr/callback/"
	},
	handler : function(req, res, next){
		req._passport.instance.authenticate('tumblr', { callbackURL: '/login/tumblr/callback/' }, function(err, user, info) {
			if (!info || !info.profile) {
				return res.redirect('/login/');
			}

			if (!info.profile.hasOwnProperty('id')) {
				info.profile.id = info.profile.username;
			}

			req.app.db.models.User.findOne({ 'tumblr.id': info.profile.id }, function(err, user) {
				if (err) {
					return next(err);
				}

				if (!user) {
					res.render('login/index', {
						oauthMessage: 'No users found linked to your Tumblr account. You may need to create an account first.',
						oauthTwitter: !!req.app.config.oauth.twitter.key,
						oauthGitHub: !!req.app.config.oauth.github.key,
						oauthFacebook: !!req.app.config.oauth.facebook.key,
						oauthGoogle: !!req.app.config.oauth.google.key,
						oauthTumblr: !!req.app.config.oauth.tumblr.key
					});
				}
				else {
					req.login(user, function(err) {
						if (err) {
							return next(err);
						}

						res.redirect(helpers.getReturnUrl(req));
					});
				}
			});
		})(req, res, next);
	}
};
