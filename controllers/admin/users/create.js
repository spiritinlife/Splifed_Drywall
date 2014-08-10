'use strict';


module.exports = {
	method : "POST",
	url : ["/admin/users/"],
	desc : "post :admin users create",
	passport : null,
	handler : function(req, res, next){
		var workflow = req.app.utility.workflow(req, res);

		workflow.on('validate', function() {
			if (!req.body.username) {
				workflow.outcome.errors.push('Please enter a username.');
				return workflow.emit('response');
			}

			if (!/^[a-zA-Z0-9\-\_]+$/.test(req.body.username)) {
				workflow.outcome.errors.push('only use letters, numbers, -, _');
				return workflow.emit('response');
			}

			workflow.emit('duplicateUsernameCheck');
		});

		workflow.on('duplicateUsernameCheck', function() {
			req.app.db.models.User.findOne({ username: req.body.username }, function(err, user) {
				if (err) {
					return workflow.emit('exception', err);
				}

				if (user) {
					workflow.outcome.errors.push('That username is already taken.');
					return workflow.emit('response');
				}

				workflow.emit('createUser');
			});
		});

		workflow.on('createUser', function() {
			var fieldsToSet = {
				username: req.body.username,
				search: [
					req.body.username
				]
			};
			req.app.db.models.User.create(fieldsToSet, function(err, user) {
				if (err) {
					return workflow.emit('exception', err);
				}

				workflow.outcome.record = user;
				return workflow.emit('response');
			});
		});

		workflow.emit('validate');
	}
};