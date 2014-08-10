
'use strict';


module.exports = {
	method : "GET",
	url : ["/signup/"],
	desc : "get : signup init",
	passport : null,
	handler : function(req, res){
		if (req.isAuthenticated()) {
			res.redirect(req.user.defaultReturnUrl());
		}
		else {
			res.render('signup/index', {
				oauthMessage: '',
				oauthTwitter: !!req.app.config.oauth.twitter.key,
				oauthGitHub: !!req.app.config.oauth.github.key,
				oauthFacebook: !!req.app.config.oauth.facebook.key,
				oauthGoogle: !!req.app.config.oauth.google.key,
				oauthTumblr: !!req.app.config.oauth.tumblr.key
			});
		}
	}
};

