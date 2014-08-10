'use strict';


module.exports = {
	method : "DELETE",
	url : ["/admin/admin-groups/:id"],
	desc : "delete :admin admin-droups id delete",
	passport : null,
	handler : function(req, res, next){
		var workflow = req.app.utility.workflow(req, res);

		workflow.on('validate', function() {
			if (!req.user.roles.admin.isMemberOf('root')) {
				workflow.outcome.errors.push('You may not delete admin groups.');
				return workflow.emit('response');
			}

			workflow.emit('deleteAdminGroup');
		});

		workflow.on('deleteAdminGroup', function(err) {
			req.app.db.models.AdminGroup.findByIdAndRemove(req.params.id, function(err, adminGroup) {
				if (err) {
					return workflow.emit('exception', err);
				}

				workflow.emit('response');
			});
		});

		workflow.emit('validate');
	}
};