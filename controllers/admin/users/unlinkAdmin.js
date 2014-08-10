'use strict';


module.exports = {
	method : "DELETE",
	url : ["/admin/users/:id/role-admin"],
	desc : "delete :admin users id role-admin delete",
	passport : null,
	handler : function(req, res, next){
		var workflow = req.app.utility.workflow(req, res);

		workflow.on('validate', function() {
			if (!req.user.roles.admin.isMemberOf('root')) {
				workflow.outcome.errors.push('You may not unlink users from admins.');
				return workflow.emit('response');
			}

			if (req.user._id === req.params.id) {
				workflow.outcome.errors.push('You may not unlink yourself from admin.');
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

				var adminId = user.roles.admin;
				user.roles.admin = null;
				user.save(function(err, user) {
					if (err) {
						return workflow.emit('exception', err);
					}

					user.populate('roles.admin roles.account', 'name.full', function(err, user) {
						if (err) {
							return workflow.emit('exception', err);
						}

						workflow.outcome.user = user;
						workflow.emit('patchAdmin', adminId);
					});
				});
			});
		});

		workflow.on('patchAdmin', function(id) {
			req.app.db.models.Admin.findById(id).exec(function(err, admin) {
				if (err) {
					return workflow.emit('exception', err);
				}

				if (!admin) {
					workflow.outcome.errors.push('Admin was not found.');
					return workflow.emit('response');
				}

				admin.user = undefined;
				admin.save(function(err, admin) {
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