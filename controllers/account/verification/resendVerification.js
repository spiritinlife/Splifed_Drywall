'use strict';

var helpers = require('./helpers');

module.exports = {
	method : "post",
	url : ["/account/verification/"],
	desc : "get : account verification resendVerification",
	passport : null,
	handler : function(req, res, next){
		if (req.user.roles.account.isVerified === 'yes') {
			return res.redirect(req.user.defaultReturnUrl());
		}

		var workflow = req.app.utility.workflow(req, res);

		workflow.on('validate', function() {
			if (!req.body.email) {
				workflow.outcome.errfor.email = 'required';
			}
			else if (!/^[a-zA-Z0-9\-\_\.\+]+@[a-zA-Z0-9\-\_\.]+\.[a-zA-Z0-9\-\_]+$/.test(req.body.email)) {
				workflow.outcome.errfor.email = 'invalid email format';
			}

			if (workflow.hasErrors()) {
				return workflow.emit('response');
			}

			workflow.emit('duplicateEmailCheck');
		});

		workflow.on('duplicateEmailCheck', function() {
			req.app.db.models.User.findOne({ email: req.body.email.toLowerCase(), _id: { $ne: req.user.id } }, function(err, user) {
				if (err) {
					return workflow.emit('exception', err);
				}

				if (user) {
					workflow.outcome.errfor.email = 'email already taken';
					return workflow.emit('response');
				}

				workflow.emit('patchUser');
			});
		});

		workflow.on('patchUser', function() {
			var fieldsToSet = { email: req.body.email.toLowerCase() };
			req.app.db.models.User.findByIdAndUpdate(req.user.id, fieldsToSet, function(err, user) {
				if (err) {
					return workflow.emit('exception', err);
				}

				workflow.user = user;
				workflow.emit('generateToken');
			});
		});

		workflow.on('generateToken', function() {
			var crypto = require('crypto');
			crypto.randomBytes(21, function(err, buf) {
				if (err) {
					return next(err);
				}

				var token = buf.toString('hex');
				req.app.db.models.User.encryptPassword(token, function(err, hash) {
					if (err) {
						return next(err);
					}

					workflow.emit('patchAccount', token, hash);
				});
			});
		});

		workflow.on('patchAccount', function(token, hash) {
			var fieldsToSet = { verificationToken: hash };
			req.app.db.models.Account.findByIdAndUpdate(req.user.roles.account.id, fieldsToSet, function(err, account) {
				if (err) {
					return workflow.emit('exception', err);
				}

				helpers.sendVerificationEmail(req, res, {
					email: workflow.user.email,
					verificationToken: token,
					onSuccess: function() {
						workflow.emit('response');
					},
					onError: function(err) {
						workflow.outcome.errors.push('Error Sending: '+ err);
						workflow.emit('response');
					}
				});
			});
		});

		workflow.emit('validate');
	}
};
