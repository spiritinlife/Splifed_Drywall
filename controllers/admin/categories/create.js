'use strict';


module.exports = {
	method : "POST",
	url : ["/admin/categories/"],
	desc : "post :admin categories create",
	passport : null,
	handler : function(req, res, next){
		var workflow = req.app.utility.workflow(req, res);

		workflow.on('validate', function() {
			if (!req.user.roles.admin.isMemberOf('root')) {
				workflow.outcome.errors.push('You may not create categories.');
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

			workflow.emit('duplicateCategoryCheck');
		});

		workflow.on('duplicateCategoryCheck', function() {
			req.app.db.models.Category.findById(req.app.utility.slugify(req.body.pivot +' '+ req.body.name)).exec(function(err, category) {
				if (err) {
					return workflow.emit('exception', err);
				}

				if (category) {
					workflow.outcome.errors.push('That category+pivot is already taken.');
					return workflow.emit('response');
				}

				workflow.emit('createCategory');
			});
		});

		workflow.on('createCategory', function() {
			var fieldsToSet = {
				_id: req.app.utility.slugify(req.body.pivot +' '+ req.body.name),
				pivot: req.body.pivot,
				name: req.body.name
			};

			req.app.db.models.Category.create(fieldsToSet, function(err, category) {
				if (err) {
					return workflow.emit('exception', err);
				}

				workflow.outcome.record = category;
				return workflow.emit('response');
			});
		});

		workflow.emit('validate');
	}
};