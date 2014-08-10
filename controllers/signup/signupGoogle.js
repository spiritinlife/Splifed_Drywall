
'use strict';


module.exports = {
	method : "GET",
	url : ["/signup/google/"],
	desc : "get : social signup - google",
	passport : {
		strategy : 'google',
		callbackURL : "/signup/google/callback/"
	},
	handler : function(req, res, next) {
		req._passport.instance.authenticate('google', { callbackURL: '/signup/google/callback/' }, function(err, user, info) {
			if (!info || !info.profile) {
				return res.redirect('/signup/');
			}

			req.app.db.models.User.findOne({ 'google.id': info.profile.id }, function(err, user) {
				if (err) {
					return next(err);
				}
				if (!user) {
					req.session.socialProfile = info.profile;
					res.render('signup/social', { email: info.profile.emails && info.profile.emails[0].value || '' });
				}
				else {
					res.render('signup/index', {
						oauthMessage: 'We found a user linked to your Google account.',
						oauthTwitter: !!req.app.config.oauth.twitter.key,
						oauthGitHub: !!req.app.config.oauth.github.key,
						oauthFacebook: !!req.app.config.oauth.facebook.key,
						oauthGoogle: !!req.app.config.oauth.google.key,
						oauthTumblr: !!req.app.config.oauth.tumblr.key
					});
				}
			});
		})(req, res, next);
	}
};