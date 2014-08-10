'use strict';


module.exports = {
	method : "POST",
	url : ["/admin/admin-groups/"],
	desc : "post :admin admin-droups create",
	passport : null,
	handler : function(req, res, next){
		var workflow = req.app.utility.workflow(req, res);

		workflow.on('validate', function() {
			if (!req.user.roles.admin.isMemberOf('root')) {
				workflow.outcome.errors.push('You may not create admin groups.');
				return workflow.emit('response');
			}

			if (!req.body.name) {
				workflow.outcome.errors.push('Please enter a name.');
				return workflow.emit('response');
			}

			workflow.emit('duplicateAdminGroupCheck');
		});

		workflow.on('duplicateAdminGroupCheck', function() {
			req.app.db.models.AdminGroup.findById(req.app.utility.slugify(req.body.name)).exec(function(err, adminGroup) {
				if (err) {
					return workflow.emit('exception', err);
				}

				if (adminGroup) {
					workflow.outcome.errors.push('That group already exists.');
					return workflow.emit('response');
				}

				workflow.emit('createAdminGroup');
			});
		});

		workflow.on('createAdminGroup', function() {
			var fieldsToSet = {
				_id: req.app.utility.slugify(req.body.name),
				name: req.body.name
			};

			req.app.db.models.AdminGroup.create(fieldsToSet, function(err, adminGroup) {
				if (err) {
					return workflow.emit('exception', err);
				}

				workflow.outcome.record = adminGroup;
				return workflow.emit('response');
			});
		});

		workflow.emit('validate');
	}
};