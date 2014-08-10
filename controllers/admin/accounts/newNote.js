'use strict';


module.exports = {
	method : "POST",
	url : ["/admin/accounts/:id/notes/"],
	desc : "post :admin accounts id notes newNote",
	passport : null,
	handler : function(req, res, next){
		var workflow = req.app.utility.workflow(req, res);

		workflow.on('validate', function() {
			if (!req.body.data) {
				workflow.outcome.errors.push('Data is required.');
				return workflow.emit('response');
			}

			workflow.emit('addNote');
		});

		workflow.on('addNote', function() {
			var noteToAdd = {
				data: req.body.data,
				userCreated: {
					id: req.user._id,
					name: req.user.username,
					time: new Date().toISOString()
				}
			};

			req.app.db.models.Account.findByIdAndUpdate(req.params.id, { $push: { notes: noteToAdd } }, function(err, account) {
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
