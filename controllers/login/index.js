
'use strict';

var helpers = require('./helpers');



module.exports = {
	method : "GET",
	url : ["/login/"],
	desc : "get : login",
	passport : null,
	handler : function(req, res){
		if (req.isAuthenticated()) {
			res.redirect(helpers.getReturnUrl(req));
		}
		else {
			res.render('login/index', {
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