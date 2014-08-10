'use strict';


module.exports = {
	method : "PUT",
	url : ["/admin/administrators/:id/groups/"],
	desc : "put :admin administrators id group",
	passport : null,
	handler : function(req, res, next){
		var workflow = req.app.utility.workflow(req, res);

		workflow.on('validate', function() {
			if (!req.user.roles.admin.isMemberOf('root')) {
				workflow.outcome.errors.push('You may not change the group memberships of admins.');
				return workflow.emit('response');
			}

			if (!req.body.groups) {
				workflow.outcome.errfor.groups = 'required';
				return workflow.emit('response');
			}

			workflow.emit('patchAdministrator');
		});

		workflow.on('patchAdministrator', function() {
			var fieldsToSet = {
				groups: req.body.groups
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