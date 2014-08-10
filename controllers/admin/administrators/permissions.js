'use strict';


module.exports = {
	method : "PUT",
	url : ["/admin/administrators/:id/permissions/"],
	desc : "put :admin administrators id permissions",
	passport : null,
	handler : function(req, res, next){
		var workflow = req.app.utility.workflow(req, res);

		workflow.on('validate', function() {
			if (!req.user.roles.admin.isMemberOf('root')) {
				workflow.outcome.errors.push('You may not change the permissions of admins.');
				return workflow.emit('response');
			}

			if (!req.body.permissions) {
				workflow.outcome.errfor.permissions = 'required';
				return workflow.emit('response');
			}

			workflow.emit('patchAdministrator');
		});

		workflow.on('patchAdministrator', function() {
			var fieldsToSet = {
				permissions: req.body.permissions
			};

			req.app.db.models.Admin.findByIdAndUpdate(req.params.id, fieldsToSet, function(err, admin) {
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