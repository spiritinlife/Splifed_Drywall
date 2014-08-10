'use strict';


module.exports = {
	method : "PUT",
	url : ["/admin/categories/:id/"],
	desc : "put :admin categories id update",
	passport : null,
	handler : function(req, res, next){
		var workflow = req.app.utility.workflow(req, res);

		workflow.on('validate', function() {
			if (!req.user.roles.admin.isMemberOf('root')) {
				workflow.outcome.errors.push('You may not update categories.');
				return workflow.emit('response');
			}

			if (!req.body.pivot) {
				workflow.outcome.errfor.pivot = 'pivot';
				return workflow.emit('response');
			}

			if (!req.body.name) {
				workflow.outcome.errfor.name = 'required';
				return workflow.emit('response');
			}

			workflow.emit('patchCategory');
		});

		workflow.on('patchCategory', function() {
			var fieldsToSet = {
				pivot: req.body.pivot,
				name: req.body.name
			};

			req.app.db.models.Category.findByIdAndUpdate(req.params.id, fieldsToSet, function(err, category) {
				if (err) {
					return workflow.emit('exception', err);
				}

				workflow.outcome.category = category;
				return workflow.emit('response');
			});
		});

		workflow.emit('validate');
	}
};