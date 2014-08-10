'use strict';


module.exports = {
	method : "DELETE",
	url : ["/admin/administrators/:id/user/"],
	desc : "put :admin administrators id user unlinkUser",
	passport : null,
	handler : function(req, res, next){
		var workflow = req.app.utility.workflow(req, res);

		workflow.on('validate', function() {
			if (!req.user.roles.admin.isMemberOf('root')) {
				workflow.outcome.errors.push('You may not unlink users from admins.');
				return workflow.emit('response');
			}

			if (req.user.roles.admin._id === req.params.id) {
				workflow.outcome.errors.push('You may not unlink yourself from admin.');
				return workflow.emit('response');
			}

			workflow.emit('patchAdministrator');
		});

		workflow.on('patchAdministrator', function() {
			req.app.db.models.Admin.findById(req.params.id).exec(function(err, admin) {
				if (err) {
					return workflow.emit('exception', err);
				}

				if (!admin) {
					workflow.outcome.errors.push('Administrator was not found.');
					return workflow.emit('response');
				}

				var userId = admin.user.id;
				admin.user = { id: undefined, name: ''};
				admin.save(function(err, admin) {
					if (err) {
						return workflow.emit('exception', err);
					}

					admin.populate('groups', 'name', function(err, admin) {
						if (err) {
							return workflow.emit('exception', err);
						}

						workflow.outcome.admin = admin;
						workflow.emit('patchUser', userId);
					});
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

				user.roles.admin = undefined;
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