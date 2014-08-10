'use strict';


module.exports = {
	method : "GET",
	url : ["/admin/accounts/:id/"],
	desc : "get :admin accounts id read",
	passport : null,
	handler : function(req, res, next){
		var outcome = {};

		var getStatusOptions = function(callback) {
			req.app.db.models.Status.find({ pivot: 'Account' }, 'name').sort('name').exec(function(err, statuses) {
				if (err) {
					return callback(err, null);
				}

				outcome.statuses = statuses;
				return callback(null, 'done');
			});
		};

		var getRecord = function(callback) {
			req.app.db.models.Account.findById(req.params.id).exec(function(err, record) {
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
				res.render('admin/accounts/details', {
					data: {
						record: escape(JSON.stringify(outcome.record)),
						statuses: outcome.statuses
					}
				});
			}
		};

		require('async').parallel([getStatusOptions, getRecord], asyncFinally);
	}
};
