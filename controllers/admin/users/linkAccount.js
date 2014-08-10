'use strict';


module.exports = {
	method : "PUT",
	url : ["/admin/users/:id/role-account/"],
	desc : "put :admin users id role-account linkAccount",
	passport : null,
	handler :  function(req, res, next){
		var workflow = req.app.utility.workflow(req, res);

		workflow.on('validate', function() {
			if (!req.user.roles.admin.isMemberOf('root')) {
				workflow.outcome.errors.push('You may not link users to accounts.');
				return workflow.emit('response');
			}

			if (!req.body.newAccountId) {
				workflow.outcome.errfor.newAccountId = 'required';
				return workflow.emit('response');
			}

			workflow.emit('verifyAccount');
		});

		workflow.on('verifyAccount', function(callback) {
			req.app.db.models.Account.findById(req.body.newAccountId).exec(function(err, account) {
				if (err) {
					return workflow.emit('exception', err);
				}

				if (!account) {
					workflow.outcome.errors.push('Account not found.');
					return workflow.emit('response');
				}

				if (account.user.id && account.user.id !== req.params.id) {
					workflow.outcome.errors.push('Account is already linked to a different user.');
					return workflow.emit('response');
				}

				workflow.account = account;
				workflow.emit('duplicateLinkCheck');
			});
		});

		workflow.on('duplicateLinkCheck', function(callback) {
			req.app.db.models.User.findOne({ 'roles.account': req.body.newAccountId, _id: {$ne: req.params.id} }).exec(function(err, user) {
				if (err) {
					return workflow.emit('exception', err);
				}

				if (user) {
					workflow.outcome.errors.push('Another user is already linked to that account.');
					return workflow.emit('response');
				}

				workflow.emit('patchUser');
			});
		});

		workflow.on('patchUser', function(callback) {
			req.app.db.models.User.findById(req.params.id).exec(function(err, user) {
				if (err) {
					return workflow.emit('exception', err);
				}

				user.roles.account = req.body.newAccountId;
				user.save(function(err, user) {
					if (err) {
						return workflow.emit('exception', err);
					}

					user.populate('roles.admin roles.account', 'name.full', function(err, user) {
						if (err) {
							return workflow.emit('exception', err);
						}

						workflow.outcome.user = user;
						workflow.emit('patchAccount');
					});
				});
			});
		});

		workflow.on('patchAccount', function() {
			workflow.account.user = { id: req.params.id, name: workflow.outcome.user.username };
			workflow.account.save(function(err, account) {
				if (err) {
					return workflow.emit('exception', err);
				}

				workflow.emit('response');
			});
		});

		workflow.emit('validate');
	}
};