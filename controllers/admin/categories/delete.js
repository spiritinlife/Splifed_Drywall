'use strict';


module.exports = {
	method : "DELETE",
	url : ["/admin/categories/:id/"],
	desc : "delete :admin categories id delete",
	passport : null,
	handler : function(req, res, next){
		var workflow = req.app.utility.workflow(req, res);

		workflow.on('validate', function() {
			if (!req.user.roles.admin.isMemberOf('root')) {
				workflow.outcome.errors.push('You may not delete categories.');
				return workflow.emit('response');
			}

			workflow.emit('deleteCategory');
		});

		workflow.on('deleteCategory', function(err) {
			req.app.db.models.Category.findByIdAndRemove(req.params.id, function(err, category) {
				if (err) {
					return workflow.emit('exception', err);
				}
				workflow.emit('response');
			});
		});

		workflow.emit('validate');
	}
};