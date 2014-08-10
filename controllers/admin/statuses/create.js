'use strict';


module.exports = {
	method : "POST",
	url : ["/admin/statuses/"],
	desc : "post :admin statuses create",
	passport : null,
	handler : function(req, res, next){
		var workflow = req.app.utility.workflow(req, res);

		workflow.on('validate', function() {
			if (!req.user.roles.admin.isMemberOf('root')) {
				workflow.outcome.errors.push('You may not create statuses.');
				return workflow.emit('response');
			}

			if (!req.body.pivot) {
				workflow.outcome.errors.push('A pivot is required.');
				return workflow.emit('response');
			}

			if (!req.body.name) {
				workflow.outcome.errors.push('A name is required.');
				return workflow.emit('response');
			}

			workflow.emit('duplicateStatusCheck');
		});

		workflow.on('duplicateStatusCheck', function() {
			req.app.db.models.Status.findById(req.app.utility.slugify(req.body.pivot +' '+ req.body.name)).exec(function(err, status) {
				if (err) {
					return workflow.emit('exception', err);
				}

				if (status) {
					workflow.outcome.errors.push('That status+pivot is already taken.');
					return workflow.emit('response');
				}

				workflow.emit('createStatus');
			});
		});

		workflow.on('createStatus', function() {
			var fieldsToSet = {
				_id: req.app.utility.slugify(req.body.pivot +' '+ req.body.name),
				pivot: req.body.pivot,
				name: req.body.name
			};

			req.app.db.models.Status.create(fieldsToSet, function(err, status) {
				if (err) {
					return workflow.emit('exception', err);
				}

				workflow.outcome.record = status;
				return workflow.emit('response');
			});
		});

		workflow.emit('validate');
	}
};