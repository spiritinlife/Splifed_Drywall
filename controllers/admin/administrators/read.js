'use strict';


module.exports = {
	method : "GET",
	url : ["/admin/administrators/:id"],
	desc : "get :admin administrators id read",
	passport : null,
	handler : function(req, res, next){
		var outcome = {};

		var getAdminGroups = function(callback) {
			req.app.db.models.AdminGroup.find({}, 'name').sort('name').exec(function(err, adminGroups) {
				if (err) {
					return callback(err, null);
				}

				outcome.adminGroups = adminGroups;
				return callback(null, 'done');
			});
		};

		var getRecord = function(callback) {
			req.app.db.models.Admin.findById(req.params.id).populate('groups', 'name').exec(function(err, record) {
				if (err) {
					return callback(err, null);
				}

				outcome.record = record;
				return callback(null, 'done');
			});
		};

		var asyncFinally = function(err, results) {
			if (err) {
				return next(err);
			}

			if (req.xhr) {
				res.send(outcome.record);
			}
			else {
				res.render('admin/administrators/details', {
					data: {
						record: escape(JSON.stringify(outcome.record)),
						adminGroups: outcome.adminGroups
					}
				});
			}
		};

		require('async').parallel([getAdminGroups, getRecord], asyncFinally);
	}
};