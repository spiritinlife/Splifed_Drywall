'use strict';


module.exports = {
	method : "PUT",
	url : ["/account/settings/identify/"],
	desc : "put : account settings indentify ",
	passport : null,
	handler : function(req, res, next){
		var workflow = req.app.utility.workflow(req, res);

		workflow.on('validate', function() {
			if (!req.body.username) {
				workflow.outcome.errfor.username = 'required';
			}
			else if (!/^[a-zA-Z0-9\-\_]+$/.test(req.body.username)) {
				workflow.outcome.errfor.username = 'only use letters, numbers, \'-\', \'_\'';
			}

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
			req.app.db.models.User.findOne({ username: req.body.username, _id: { $ne: req.user.id } }, function(err, user) {
				if (err) {
					return workflow.emit('exception', err);
				}

				if (user) {
					workflow.outcome.errfor.username = 'username already taken';
					return workflow.emit('response');
				}

				workflow.emit('duplicateEmailCheck');
			});
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
			var fieldsToSet = {
				username: req.body.username,
				email: req.body.email.toLowerCase(),
				search: [
					req.body.username,
					req.body.email
				]
			};
			var options = { select: 'username email twitter.id github.id facebook.id google.id' };

			req.app.db.models.User.findByIdAndUpdate(req.user.id, fieldsToSet, options, function(err, user) {
				if (err) {
					return workflow.emit('exception', err);
				}

				workflow.emit('patchAdmin', user);
			});
		});

		workflow.on('patchAdmin', function(user) {
			if (user.roles.admin) {
				var fieldsToSet = {
					user: {
						id: req.user.id,
						name: user.username
					}
				};
				req.app.db.models.Admin.findByIdAndUpdate(user.roles.admin, fieldsToSet, function(err, admin) {
					if (err) {
						return workflow.emit('exception', err);
					}

					workflow.emit('patchAccount', user);
				});
			}
			else {
				workflow.emit('patchAccount', user);
			}
		});

		workflow.on('patchAccount', function(user) {
			if (user.roles.account) {
				var fieldsToSet = {
					user: {
						id: req.user.id,
						name: user.username
					}
				};
				req.app.db.models.Account.findByIdAndUpdate(user.roles.account, fieldsToSet, function(err, account) {
					if (err) {
						return workflow.emit('exception', err);
					}

					workflow.emit('populateRoles', user);
				});
			}
			else {
				workflow.emit('populateRoles', user);
			}
		});

		workflow.on('populateRoles', function(user) {
			user.populate('roles.admin roles.account', 'name.full', function(err, populatedUser) {
				if (err) {
					return workflow.emit('exception', err);
				}

				workflow.outcome.user = populatedUser;
				workflow.emit('response');
			});
		});

		workflow.emit('validate');
	}
};