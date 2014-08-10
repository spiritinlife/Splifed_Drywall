'use strict';


module.exports = {
	method : "GET",
	url : ["/admin/categories/:id"],
	desc : "get :admin categories id read",
	passport : null,
	handler : function(req, res, next){
		req.app.db.models.Category.findById(req.params.id).exec(function(err, category) {
			if (err) {
				return next(err);
			}

			if (req.xhr) {
				res.send(category);
			}
			else {
				res.render('admin/categories/details', { data: { record: escape(JSON.stringify(category)) } });
			}
		});
	}
};