'use strict';


module.exports = {
	method : "GET",
	url : ["/admin/accounts/"],
	desc : "get :admin accounts find",
	passport : null,
	handler :  function(req, res, next){
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

		var getResults = function(callback) {
			req.query.search = req.query.search ? req.query.search : '';
			req.query.status = req.query.status ? req.query.status : '';
			req.query.limit = req.query.limit ? parseInt(req.query.limit, null) : 20;
			req.query.page = req.query.page ? parseInt(req.query.page, null) : 1;
			req.query.sort = req.query.sort ? req.query.sort : '_id';

			var filters = {};
			if (req.query.search) {
				filters.search = new RegExp('^.*?'+ req.query.search +'.*$', 'i');
			}

			if (req.query.status) {
				filters['status.id'] = req.query.status;
			}

			req.app.db.models.Account.pagedFind({
				filters: filters,
				keys: 'name company phone zip userCreated status',
				limit: req.query.limit,
				page: req.query.page,
				sort: req.query.sort
			}, function(err, results) {
				if (err) {
					return callback(err, null);
				}

				outcome.results = results;
				return callback(null, 'done');
			});
		};

		var asyncFinally = function(err, results) {
			if (err) {
				return next(err);
			}

			if (req.xhr) {
				res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
				outcome.results.filters = req.query;
				res.send(outcome.results);
			}
			else {
				outcome.results.filters = req.query;
				res.render('admin/accounts/index', {
					data: {
						results: escape(JSON.stringify(outcome.results)),
						statuses: outcome.statuses
					}
				});
			}
		};

		require('async').parallel([getStatusOptions, getResults], asyncFinally);
	}
};
