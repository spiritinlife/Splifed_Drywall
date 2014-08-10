'use strict';


module.exports = {
	method : "GET",
	url : ["/account/verification/:token"],
	desc : "get : account verification verify",
	passport : null,
	handler : function(req, res, next){
  	req.app.db.models.User.validatePassword(req.params.token, req.user.roles.account.verificationToken, function(err, isValid) {
			if (!isValid) {
				return res.redirect(req.user.defaultReturnUrl());
			}

			var fieldsToSet = { isVerified: 'yes', verificationToken: '' };
			req.app.db.models.Account.findByIdAndUpdate(req.user.roles.account._id, fieldsToSet, function(err, account) {
				if (err) {
					return next(err);
				}

				return res.redirect(req.user.defaultReturnUrl());
			});
		});
	}
};