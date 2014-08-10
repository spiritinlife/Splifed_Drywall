'use strict';


module.exports = {
	method : "GET",
	url : ["/admin/admin-groups/"],
	desc : "get :admin admin-droups find",
	passport : null,
	handler : function(req, res, next){
		req.query.name = req.query.name ? req.query.name : '';
		req.query.limit = req.query.limit ? parseInt(req.query.limit, null) : 20;
		req.query.page = req.query.page ? parseInt(req.query.page, null) : 1;
		req.query.sort = req.query.sort ? req.query.sort : '_id';

		var filters = {};
		if (req.query.name) {
			filters.name = new RegExp('^.*?'+ req.query.name +'.*$', 'i');
		}

		req.app.db.models.AdminGroup.pagedFind({
			filters: filters,
			keys: 'name',
			limit: req.query.limit,
			page: req.query.page,
			sort: req.query.sort
		}, function(err, results) {
			if (err) {
				return next(err);
			}

			if (req.xhr) {
				res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
				results.filters = req.query;
				res.send(results);
			}
			else {
				results.filters = req.query;
				res.render('admin/admin-groups/index', { data: { results: escape(JSON.stringify(results)) } });
			}
		});
	}
};