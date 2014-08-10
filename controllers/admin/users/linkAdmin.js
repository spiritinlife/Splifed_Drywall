'use strict';


module.exports = {
	method : "PUT",
	url : ["/admin/users/:id/role-admin/"],
	desc : "put :admin users id role-admin linkAdmin",
	passport : null,
	handler : function(req, res, next){
		var workflow = req.app.utility.workflow(req, res);

		workflow.on('validate', function() {
			if (!req.user.roles.admin.isMemberOf('root')) {
				workflow.outcome.errors.push('You may not link users to admins.');
				return workflow.emit('response');
			}

			if (!req.body.newAdminId) {
				workflow.outcome.errfor.newAdminId = 'required';
				return workflow.emit('response');
			}

			workflow.emit('verifyAdmin');
		});

		workflow.on('verifyAdmin', function(callback) {
			req.app.db.models.Admin.findById(req.body.newAdminId).exec(function(err, admin) {
				if (err) {
					return workflow.emit('exception', err);
				}

				if (!admin) {
					workflow.outcome.errors.push('Admin not found.');
					return workflow.emit('response');
				}

				if (admin.user.id && admin.user.id !== req.params.id) {
					workflow.outcome.errors.push('Admin is already linked to a different user.');
					return workflow.emit('response');
				}

				workflow.admin = admin;
				workflow.emit('duplicateLinkCheck');
			});
		});

		workflow.on('duplicateLinkCheck', function(callback) {
			req.app.db.models.User.findOne({ 'roles.admin': req.body.newAdminId, _id: {$ne: req.params.id} }).exec(function(err, user) {
				if (err) {
					return workflow.emit('exception', err);
				}

				if (user) {
					workflow.outcome.errors.push('Another user is already linked to that admin.');
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

				user.roles.admin = req.body.newAdminId;
				user.save(function(err, user) {
					if (err) {
						return workflow.emit('exception', err);
					}

					user.populate('roles.admin roles.account', 'name.full', function(err, user) {
						if (err) {
							return workflow.emit('exception', err);
						}

						workflow.outcome.user = user;
						workflow.emit('patchAdmin');
					});
				});
			});
		});

		workflow.on('patchAdmin', function() {
			workflow.admin.user = { id: req.params.id, name: workflow.outcome.user.username };
			workflow.admin.save(function(err, admin) {
				if (err) {
					return workflow.emit('exception', err);
				}

				workflow.emit('response');
			});
		});

		workflow.emit('validate');
	}
};