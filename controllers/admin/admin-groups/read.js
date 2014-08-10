'use strict';


module.exports = {
	method : "GET",
	url : ["/admin/admin-groups/:id"],
	desc : "get :admin admin-droups read",
	passport : null,
	handler :  function(req, res, next){
		req.app.db.models.AdminGroup.findById(req.params.id).exec(function(err, adminGroup) {
			if (err) {
				return next(err);
			}

			if (req.xhr) {
				res.send(adminGroup);
			}
			else {
				res.render('admin/admin-groups/details', { data: { record: escape(JSON.stringify(adminGroup)) } });
			}
		});
	}
};