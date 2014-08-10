'use strict';

var helpers = require('./helpers');


module.exports = {
	method : "GET",
	url : ["/login/twitter/"],
	desc : "get : social login - twitter",
	passport : {
		strategy : 'twitter',
		callbackURL : "/login/twitter/callback/"
	},
	handler : function(req, res, next){
		req._passport.instance.authenticate('twitter', function(err, user, info) {
			if (!info || !info.profile) {
				return res.redirect('/login/');
			}

			req.app.db.models.User.findOne({ 'twitter.id': info.profile.id }, function(err, user) {
				if (err) {
					return next(err);
				}

				if (!user) {
					res.render('login/index', {
						oauthMessage: 'No users found linked to your Twitter account. You may need to create an account first.',
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