'use strict';


module.exports = {
	method : "PUT",
	url : ["/admin/administrators/:id"],
	desc : "PUT :admin administrators id update",
	passport : null,
	handler : function(req, res, next){
		var workflow = req.app.utility.workflow(req, res);

		workflow.on('validate', function() {
			if (!req.body.first) {
				workflow.outcome.errfor.first = 'required';
			}

			if (!req.body.last) {
				workflow.outcome.errfor.last = 'required';
			}

			if (workflow.hasErrors()) {
				return workflow.emit('response');
			}

			workflow.emit('patchAdministrator');
		});

		workflow.on('patchAdministrator', function() {
			var fieldsToSet = {
				name: {
					first: req.body.first,
					middle: req.body.middle,
					last: req.body.last,
					full: req.body.first +' '+ req.body.last
				},
				search: [
					req.body.first,
					req.body.middle,
					req.body.last
				]
			};

			req.app.db.models.Admin.findByIdAndUpdate(req.params.id, fieldsToSet, function(err, admin) {
				if (err) {
					return workflow.emit('exception', err);
				}

				admin.populate('groups', 'name', function(err, admin) {
					if (err) {
						return workflow.emit('exception', err);
					}

					workflow.outcome.admin = admin;
					workflow.emit('response');
				});
			});
		});

		workflow.emit('validate');
	}
};