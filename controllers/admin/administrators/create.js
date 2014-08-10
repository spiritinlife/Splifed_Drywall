'use strict';


module.exports = {
	method : "POST",
	url : ["/admin/administrators/"],
	desc : "post :admin administrators create",
	passport : null,
	handler : function(req, res, next){
		var workflow = req.app.utility.workflow(req, res);

		workflow.on('validate', function() {
			if (!req.body['name.full']) {
				workflow.outcome.errors.push('Please enter a name.');
				return workflow.emit('response');
			}

			workflow.emit('createAdministrator');
		});

		workflow.on('createAdministrator', function() {
			var nameParts = req.body['name.full'].trim().split(/\s/);
			var fieldsToSet = {
				name: {
					first: nameParts.shift(),
					middle: (nameParts.length > 1 ? nameParts.shift() : ''),
					last: (nameParts.length === 0 ? '' : nameParts.join(' ')),
				}
			};
			fieldsToSet.name.full = fieldsToSet.name.first + (fieldsToSet.name.last ? ' '+ fieldsToSet.name.last : '');
			fieldsToSet.search = [
				fieldsToSet.name.first,
				fieldsToSet.name.middle,
				fieldsToSet.name.last
			];

			req.app.db.models.Admin.create(fieldsToSet, function(err, admin) {
				if (err) {
					return workflow.emit('exception', err);
				}

				workflow.outcome.record = admin;
				return workflow.emit('response');
			});
		});

		workflow.emit('validate');
	}
};