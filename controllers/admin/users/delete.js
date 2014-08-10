'use strict';


module.exports = {
	method : "DELETE",
	url : ["/admin/users/:id/"],
	desc : "delete :admin users id delete",
	passport : null,
	handler : function(req, res, next){
		var workflow = req.app.utility.workflow(req, res);

		workflow.on('validate', function() {
			if (!req.user.roles.admin.isMemberOf('root')) {
				workflow.outcome.errors.push('You may not delete users.');
				return workflow.emit('response');
			}

			if (req.user._id === req.params.id) {
				workflow.outcome.errors.push('You may not delete yourself from user.');
				return workflow.emit('response');
			}

			workflow.emit('deleteUser');
		});

		workflow.on('deleteUser', function(err) {
			req.app.db.models.User.findByIdAndRemove(req.params.id, function(err, user) {
				if (err) {
					return workflow.emit('exception', err);
				}

				workflow.emit('response');
			});
		});

		workflow.emit('validate');
	}
};