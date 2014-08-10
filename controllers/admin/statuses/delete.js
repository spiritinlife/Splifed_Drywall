'use strict';


module.exports = {
	method : "DELETE",
	url : ["/admin/statuses/:id/"],
	desc : "delete :admin statuses id delete",
	passport : null,
	handler : function(req, res, next){
		var workflow = req.app.utility.workflow(req, res);

		workflow.on('validate', function() {
			if (!req.user.roles.admin.isMemberOf('root')) {
				workflow.outcome.errors.push('You may not delete statuses.');
				return workflow.emit('response');
			}

			workflow.emit('deleteStatus');
		});

		workflow.on('deleteStatus', function(err) {
			req.app.db.models.Status.findByIdAndRemove(req.params.id, function(err, status) {
				if (err) {
					return workflow.emit('exception', err);
				}

				workflow.emit('response');
			});
		});

		workflow.emit('validate');
	}
};