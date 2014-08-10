'use strict';


module.exports = {
	method : "GET",
	url : ["/admin/administrators/"],
	desc : "get :admin administrators find",
	passport : null,
	handler : function(req, res, next){
		req.query.search = req.query.search ? req.query.search : '';
		req.query.limit = req.query.limit ? parseInt(req.query.limit, null) : 20;
		req.query.page = req.query.page ? parseInt(req.query.page, null) : 1;
		req.query.sort = req.query.sort ? req.query.sort : '_id';

		var filters = {};
		if (req.query.search) {
			filters.search = new RegExp('^.*?'+ req.query.search +'.*$', 'i');
		}

		req.app.db.models.Admin.pagedFind({
			filters: filters,
			keys: 'name.full',
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
				res.render('admin/administrators/index', { data: { results: escape(JSON.stringify(results)) } });
			}
		});
	}
};