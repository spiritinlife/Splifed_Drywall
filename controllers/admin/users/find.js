'use strict';


module.exports = {
	method : "GET",
	url : ["/admin/users/"],
	desc : "get :admin user find",
	passport : null,
	handler : function(req, res, next){
		req.query.username = req.query.username ? req.query.username : '';
		req.query.limit = req.query.limit ? parseInt(req.query.limit, null) : 20;
		req.query.page = req.query.page ? parseInt(req.query.page, null) : 1;
		req.query.sort = req.query.sort ? req.query.sort : '_id';

		var filters = {};
		if (req.query.username) {
			filters.username = new RegExp('^.*?'+ req.query.username +'.*$', 'i');
		}

		if (req.query.isActive) {
			filters.isActive = req.query.isActive;
		}

		if (req.query.roles && req.query.roles === 'admin') {
			filters['roles.admin'] = { $exists: true };
		}

		if (req.query.roles && req.query.roles === 'account') {
			filters['roles.account'] = { $exists: true };
		}

		req.app.db.models.User.pagedFind({
			filters: filters,
			keys: 'username email isActive',
			limit: req.query.limit,
			page: req.query.page,
			sort: req.query.sort
		}, function(err, results) {
			if (err) {
				return next(err);
			}

			if (req.xhr) {
				res.header("Cache-Control", "no-cache, no-store, must-revalidate");
				results.filters = req.query;
				res.send(results);
			}
			else {
				results.filters = req.query;
				res.render('admin/users/index', { data: { results: JSON.stringify(results) } });
			}
		});
	}
};