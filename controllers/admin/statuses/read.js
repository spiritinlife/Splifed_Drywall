'use strict';


module.exports = {
	method : "GET",
	url : ["/admin/statuses/:id/"],
	desc : "get :admin statuses id read",
	passport : null,
	handler : function(req, res, next){
		req.app.db.models.Status.findById(req.params.id).exec(function(err, status) {
			if (err) {
				return next(err);
			}

			if (req.xhr) {
				res.send(status);
			}
			else {
				res.render('admin/statuses/details', { data: { record: escape(JSON.stringify(status)) } });
			}
		});
	}
};