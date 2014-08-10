
'use strict';


module.exports = {
	method : "GET",
	url : ["/signup/facebook/"],
	desc : "get : social signup - facebook",
	passport : {
		strategy : 'facebook',
		callbackURL : "/signup/tumblr/callback/"
	},
	handler : function(req, res, next) {
		req._passport.instance.authenticate('facebook', { callbackURL: '/signup/facebook/callback/' }, function(err, user, info) {
			if (!info || !info.profile) {
				return res.redirect('/signup/');
			}

			req.app.db.models.User.findOne({ 'facebook.id': info.profile.id }, function(err, user) {
				if (err) {
					return next(err);
				}
				if (!user) {
					req.session.socialProfile = info.profile;
					res.render('signup/social', { email: info.profile.emails && info.profile.emails[0].value || '' });
				}
				else {
					res.render('signup/index', {
						oauthMessage: 'We found a user linked to your Facebook account.',
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
