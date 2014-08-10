'use strict';

module.exports = {
	method : "all",
	url : ["/account*",],
	desc : "all others : ensureAccount on /account* ",
	passport : null,
	handler : function(req, res, next) {
  if (req.user.canPlayRoleOf('account')) {
    if (req.app.config.requireAccountVerification) {
      if (req.user.roles.account.isVerified !== 'yes' && !/^\/account\/verification\//.test(req.url)) {
        return res.redirect('/account/verification/');
      }
    }
    return next();
  }
  res.redirect('/');
}
};

