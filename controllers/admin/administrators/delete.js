'use strict';


module.exports = {
	method : "DELETE",
	url : ["/admin/administrators/:id/"],
	desc : "delete :admin administrators id delete",
	passport : null,
	handler : function(req, res, next){
		var workflow = req.app.utility.workflow(req, res);

		workflow.on('validate', function() {
			if (!req.user.roles.admin.isMemberOf('root')) {
				workflow.outcome.errors.push('You may not delete admins.');
				return workflow.emit('response');
			}

			if (req.user.roles.admin._id === req.params.id) {
				workflow.outcome.errors.push('You may not delete your own admin record.');
				return workflow.emit('response');
			}

			workflow.emit('deleteAdministrator');
		});

		workflow.on('deleteAdministrator', function(err) {
			req.app.db.models.Admin.findByIdAndRemove(req.params.id, function(err, admin) {
				if (err) {
					return workflow.emit('exception', err);
				}

				workflow.emit('response');
			});
		});

		workflow.emit('validate');
	}
};