'use strict';


module.exports = {
	method : "PUT",
	url : ["/admin/users/:id/password/"],
	desc : "put :admin users id password",
	passport : null,
	handler : function(req, res, next){
		var workflow = req.app.utility.workflow(req, res);

		workflow.on('validate', function() {
			if (!req.body.newPassword) {
				workflow.outcome.errfor.newPassword = 'required';
			}

			if (!req.body.confirm) {
				workflow.outcome.errfor.confirm = 'required';
			}

			if (req.body.newPassword !== req.body.confirm) {
				workflow.outcome.errors.push('Passwords do not match.');
			}

			if (workflow.hasErrors()) {
				return workflow.emit('response');
			}

			workflow.emit('patchUser');
		});

		workflow.on('patchUser', function() {
			req.app.db.models.User.encryptPassword(req.body.newPassword, function(err, hash) {
				if (err) {
					return workflow.emit('exception', err);
				}

				var fieldsToSet = { password: hash };
				req.app.db.models.User.findByIdAndUpdate(req.params.id, fieldsToSet, function(err, user) {
					if (err) {
						return workflow.emit('exception', err);
					}

					user.populate('roles.admin roles.account', 'name.full', function(err, user) {
						if (err) {
							return workflow.emit('exception', err);
						}

						workflow.outcome.user = user;
						workflow.outcome.newPassword = '';
						workflow.outcome.confirm = '';
						workflow.emit('response');
					});$
				});
			});
		});

		workflow.emit('validate');
	}
};