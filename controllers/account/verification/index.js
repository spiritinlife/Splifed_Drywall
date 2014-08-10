'use strict';

var helpers = require('./helpers');

module.exports = {
	method : "GET",
	url : ["/account/verification/"],
	desc : "get : account verification init",
	passport : null,
	handler : function(req, res, next){
		if (req.user.roles.account.isVerified === 'yes') {
			return res.redirect(req.user.defaultReturnUrl());
		}

		var workflow = req.app.utility.workflow(req, res);

		workflow.on('renderPage', function() {
			req.app.db.models.User.findById(req.user.id, 'email').exec(function(err, user) {
				if (err) {
					return next(err);
				}

				res.render('account/verification/index', {
					data: {
						user: JSON.stringify(user)
					}
				});
			});
		});

		workflow.on('generateTokenOrRender', function() {
			if (req.user.roles.account.verificationToken !== '') {
				return workflow.emit('renderPage');
			}

			workflow.emit('generateToken');
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
					return next(err);
				}

				helpers.sendVerificationEmail(req, res, {
					email: req.user.email,
					verificationToken: token,
					onSuccess: function() {
						return workflow.emit('renderPage');
					},
					onError: function(err) {
						return next(err);
					}
				});
			});
		});

		workflow.emit('generateTokenOrRender');
	}
};