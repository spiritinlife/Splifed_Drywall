'use strict';


module.exports = {
	method : "PUT",
	url : ["/admin/administrators/:id/user/"],
	desc : "put :admin administrators id user linkUser",
	passport : null,
	handler : function(req, res, next){
		var workflow = req.app.utility.workflow(req, res);

		workflow.on('validate', function() {
			if (!req.user.roles.admin.isMemberOf('root')) {
				workflow.outcome.errors.push('You may not link admins to users.');
				return workflow.emit('response');
			}

			if (!req.body.newUsername) {
				workflow.outcome.errfor.newUsername = 'required';
				return workflow.emit('response');
			}

			workflow.emit('verifyUser');
		});

		workflow.on('verifyUser', function(callback) {
			req.app.db.models.User.findOne({ username: req.body.newUsername }, 'username').exec(function(err, user) {
				if (err) {
					return workflow.emit('exception', err);
				}

				if (!user) {
					workflow.outcome.errors.push('User not found.');
					return workflow.emit('response');
				}
				else if (user.roles && user.roles.admin && user.roles.admin !== req.params.id) {
					workflow.outcome.errors.push('User is already linked to a different admin.');
					return workflow.emit('response');
				}

				workflow.user = user;
				workflow.emit('duplicateLinkCheck');
			});
		});

		workflow.on('duplicateLinkCheck', function(callback) {
			req.app.db.models.Admin.findOne({ 'user.id': workflow.user._id, _id: { $ne: req.params.id } }).exec(function(err, admin) {
				if (err) {
					return workflow.emit('exception', err);
				}

				if (admin) {
					workflow.outcome.errors.push('Another admin is already linked to that user.');
					return workflow.emit('response');
				}

				workflow.emit('patchUser');
			});
		});

		workflow.on('patchUser', function() {
			req.app.db.models.User.findByIdAndUpdate(workflow.user._id, { 'roles.admin': req.params.id }).exec(function(err, user) {
				if (err) {
					return workflow.emit('exception', err);
				}
				workflow.emit('patchAdministrator');
			});
		});

		workflow.on('patchAdministrator', function(callback) {
			req.app.db.models.Admin.findByIdAndUpdate(req.params.id, { user: { id: workflow.user._id, name: workflow.user.username } }).exec(function(err, admin) {
				if (err) {
					return workflow.emit('exception', err);
				}

				admin.populate('groups', 'name', function(err, admin) {
					if (err) {
						return workflow.emit('exception', err);
					}

					workflow.outcome.admin = admin;
					workflow.emit('response');
				});
			});
		});

		workflow.emit('validate');
	}
};