'use strict';


module.exports = {
	method : "POST",
	url : ["/admin/admin-groups/:id/permissions"],
	desc : "post :admin admin-droups id permissions",
	passport : null,
	handler : function(req, res, next){
		var workflow = req.app.utility.workflow(req, res);

		workflow.on('validate', function() {
			if (!req.user.roles.admin.isMemberOf('root')) {
				workflow.outcome.errors.push('You may not change the permissions of admin groups.');
				return workflow.emit('response');
			}

			if (!req.body.permissions) {
				workflow.outcome.errfor.permissions = 'required';
				return workflow.emit('response');
			}

			workflow.emit('patchAdminGroup');
		});

		workflow.on('patchAdminGroup', function() {
			var fieldsToSet = {
				permissions: req.body.permissions
			};

			req.app.db.models.AdminGroup.findByIdAndUpdate(req.params.id, fieldsToSet, function(err, adminGroup) {
				if (err) {
					return workflow.emit('exception', err);
				}

				workflow.outcome.adminGroup = adminGroup;
				return workflow.emit('response');
			});
		});

		workflow.emit('validate');
	}
};