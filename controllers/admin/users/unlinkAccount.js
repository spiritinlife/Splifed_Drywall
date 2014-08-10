'use strict';


module.exports = {
	method : "DELETE",
	url : ["/admin/users/:id/role-account/"],
	desc : "delete :admin users id role-account unlinkAccount",
	passport : null,
	handler : function(req, res, next){
		var workflow = req.app.utility.workflow(req, res);

		workflow.on('validate', function() {
			if (!req.user.roles.admin.isMemberOf('root')) {
				workflow.outcome.errors.push('You may not unlink users from accounts.');
				return workflow.emit('response');
			}

			workflow.emit('patchUser');
		});

		workflow.on('patchUser', function() {
			req.app.db.models.User.findById(req.params.id).exec(function(err, user) {
				if (err) {
					return workflow.emit('exception', err);
				}

				if (!user) {
					workflow.outcome.errors.push('User was not found.');
					return workflow.emit('response');
				}

				var accountId = user.roles.account;
				user.roles.account = null;
				user.save(function(err, user) {
					if (err) {
						return workflow.emit('exception', err);
					}

					user.populate('roles.admin roles.account', 'name.full', function(err, user) {
						if (err) {
							return workflow.emit('exception', err);
						}

						workflow.outcome.user = user;
						workflow.emit('patchAccount', accountId);
					});
				});
			});
		});

		workflow.on('patchAccount', function(id) {
			req.app.db.models.Account.findById(id).exec(function(err, account) {
				if (err) {
					return workflow.emit('exception', err);
				}

				if (!account) {
					workflow.outcome.errors.push('Account was not found.');
					return workflow.emit('response');
				}

				account.user = undefined;
				account.save(function(err, account) {
					if (err) {
						return workflow.emit('exception', err);
					}

					workflow.emit('response');
				});
			});
		});

		workflow.emit('validate');
	}
};