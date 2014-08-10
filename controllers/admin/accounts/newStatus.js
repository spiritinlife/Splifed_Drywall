'use strict';


module.exports = {
	method : "POST",
	url : ["/admin/accounts/:id/status"],
	desc : "post :admin accounts id status newStatus",
	passport : null,
	handler : function(req, res, next){
		var workflow = req.app.utility.workflow(req, res);

		workflow.on('validate', function() {
			if (!req.body.id) {
				workflow.outcome.errors.push('Please choose a status.');
			}

			if (workflow.hasErrors()) {
				return workflow.emit('response');
			}

			workflow.emit('addStatus');
		});

		workflow.on('addStatus', function() {
			var statusToAdd = {
				id: req.body.id,
				name: req.body.name,
				userCreated: {
					id: req.user._id,
					name: req.user.username,
					time: new Date().toISOString()
				}
			};

			req.app.db.models.Account.findByIdAndUpdate(req.params.id, { status: statusToAdd, $push: { statusLog: statusToAdd } }, function(err, account) {
				if (err) {
					return workflow.emit('exception', err);
				}

				workflow.outcome.account = account;
				return workflow.emit('response');
			});
		});

		workflow.emit('validate');
	}
};