'use strict';


module.exports = {
	method : "DELETE",
	url : ["/admin/accounts/:id/user"],
	desc : "delete :admin accounts id unlinkuser",
	passport : null,
	handler : function(req, res, next){
		var workflow = req.app.utility.workflow(req, res);

		workflow.on('validate', function() {
			if (!req.user.roles.admin.isMemberOf('root')) {
				workflow.outcome.errors.push('You may not unlink users from accounts.');
				return workflow.emit('response');
			}

			workflow.emit('patchAccount');
		});

		workflow.on('patchAccount', function() {
			req.app.db.models.Account.findById(req.params.id).exec(function(err, account) {
				if (err) {
					return workflow.emit('exception', err);
				}

				if (!account) {
					workflow.outcome.errors.push('Account was not found.');
					return workflow.emit('response');
				}

				var userId = account.user.id;
				account.user = { id: undefined, name: '' };
				account.save(function(err, account) {
					if (err) {
						return workflow.emit('exception', err);
					}

					workflow.outcome.account = account;
					workflow.emit('patchUser', userId);
				});
			});
		});

		workflow.on('patchUser', function(id) {
			req.app.db.models.User.findById(id).exec(function(err, user) {
				if (err) {
					return workflow.emit('exception', err);
				}

				if (!user) {
					workflow.outcome.errors.push('User was not found.');
					return workflow.emit('response');
				}

				user.roles.account = undefined;
				user.save(function(err, user) {
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