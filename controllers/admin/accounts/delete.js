'use strict';


module.exports = {
	method : "DELETE",
	url : ["/admin/accounts/:id/"],
	desc : "delete :admin accounts id delete user",
	passport : null,
	handler : function(req, res, next){
		var workflow = req.app.utility.workflow(req, res);

		workflow.on('validate', function() {
			if (!req.user.roles.admin.isMemberOf('root')) {
				workflow.outcome.errors.push('You may not delete accounts.');
				return workflow.emit('response');
			}

			workflow.emit('deleteAccount');
		});

		workflow.on('deleteAccount', function(err) {
			req.app.db.models.Account.findByIdAndRemove(req.params.id, function(err, account) {
				if (err) {
					return workflow.emit('exception', err);
				}

				workflow.outcome.account = account;
				workflow.emit('response');
			});
		});

		workflow.emit('validate');
	}
};