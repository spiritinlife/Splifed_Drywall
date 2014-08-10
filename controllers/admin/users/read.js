'use strict';


module.exports = {
	method : "GET",
	url : ["/admin/users/:id/"],
	desc : "get :admin user id read",
	passport : null,
	handler : function(req, res, next){
		req.app.db.models.User.findById(req.params.id).populate('roles.admin', 'name.full').populate('roles.account', 'name.full').exec(function(err, user) {
			if (err) {
				return next(err);
			}

			if (req.xhr) {
				res.send(user);
			}
			else {
				res.render('admin/users/details', { data: { record: escape(JSON.stringify(user)) } });
			}
		});
	}
};