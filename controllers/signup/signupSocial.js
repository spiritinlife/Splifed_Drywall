'use strict';

module.exports = {
	method : "POST",
	url : ["/signup/social/"],
	desc : "post : social signup",
	passport : null,
	handler :  function(req, res){
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

			workflow.emit('duplicateUsernameCheck');
		});

		workflow.on('duplicateUsernameCheck', function() {
			workflow.username = req.session.socialProfile.username || req.session.socialProfile.id;
			if (!/^[a-zA-Z0-9\-\_]+$/.test(workflow.username)) {
				workflow.username = workflow.username.replace(/[^a-zA-Z0-9\-\_]/g, '');
			}

			req.app.db.models.User.findOne({ username: workflow.username }, function(err, user) {
				if (err) {
					return workflow.emit('exception', err);
				}

				if (user) {
					workflow.username = workflow.username + req.session.socialProfile.id;
				}
				else {
					workflow.username = workflow.username;
				}

				workflow.emit('duplicateEmailCheck');
			});
		});

		workflow.on('duplicateEmailCheck', function() {
			req.app.db.models.User.findOne({ email: req.body.email.toLowerCase() }, function(err, user) {
				if (err) {
					return workflow.emit('exception', err);
				}

				if (user) {
					workflow.outcome.errfor.email = 'email already registered';
					return workflow.emit('response');
				}

				workflow.emit('createUser');
			});
		});

		workflow.on('createUser', function() {
			var fieldsToSet = {
				isActive: 'yes',
				username: workflow.username,
				email: req.body.email.toLowerCase(),
				search: [
					workflow.username,
					req.body.email
				]
			};
			fieldsToSet[req.session.socialProfile.provider] = { id: req.session.socialProfile.id };

			req.app.db.models.User.create(fieldsToSet, function(err, user) {
				if (err) {
					return workflow.emit('exception', err);
				}

				workflow.user = user;
				workflow.emit('createAccount');
			});
		});

		workflow.on('createAccount', function() {
			var displayName = req.session.socialProfile.displayName || '';
			var nameParts = displayName.split(' ');
			var fieldsToSet = {
				isVerified: 'yes',
				'name.first': nameParts[0],
				'name.last': nameParts[1] || '',
				'name.full': displayName,
				user: {
					id: workflow.user._id,
					name: workflow.user.username
				},
				search: [
					nameParts[0],
					nameParts[1] || ''
				]
			};
			req.app.db.models.Account.create(fieldsToSet, function(err, account) {
				if (err) {
					return workflow.emit('exception', err);
				}

				//update user with account
				workflow.user.roles.account = account._id;
				workflow.user.save(function(err, user) {
					if (err) {
						return workflow.emit('exception', err);
					}

					workflow.emit('sendWelcomeEmail');
				});
			});
		});

		workflow.on('sendWelcomeEmail', function() {
			req.app.utility.sendmail(req, res, {
				from: req.app.config.smtp.from.name +' <'+ req.app.config.smtp.from.address +'>',
				to: req.body.email,
				subject: 'Your '+ req.app.config.projectName +' Account',
				textPath: 'signup/email-text',
				htmlPath: 'signup/email-html',
				locals: {
					username: workflow.user.username,
					email: req.body.email,
					loginURL: req.protocol +'://'+ req.headers.host +'/login/',
					projectName: req.app.config.projectName
				},
				success: function(message) {
					workflow.emit('logUserIn');
				},
				error: function(err) {
					console.log('Error Sending Welcome Email: '+ err);
					workflow.emit('logUserIn');
				}
			});
		});

		workflow.on('logUserIn', function() {
			req.login(workflow.user, function(err) {
				if (err) {
					return workflow.emit('exception', err);
				}

				delete req.session.socialProfile;
				workflow.outcome.defaultReturnUrl = workflow.user.defaultReturnUrl();
				workflow.emit('response');
			});
		});

		workflow.emit('validate');
	}
};
