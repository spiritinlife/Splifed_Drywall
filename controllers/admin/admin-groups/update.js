'use strict';


module.exports = {
	method : "PUT",
	url : ["/admin/admin-groups/:id"],
	desc : "put :admin admin-droups update",
	passport : null,
	handler : function(req, res, next){
		var workflow = req.app.utility.workflow(req, res);

		workflow.on('validate', function() {
			if (!req.user.roles.admin.isMemberOf('root')) {
				workflow.outcome.errors.push('You may not update admin groups.');
				return workflow.emit('response');
			}

			if (!req.body.name) {
				workflow.outcome.errfor.name = 'required';
				return workflow.emit('response');
			}

			workflow.emit('patchAdminGroup');
		});

		workflow.on('patchAdminGroup', function() {
			var fieldsToSet = {
				name: req.body.name
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