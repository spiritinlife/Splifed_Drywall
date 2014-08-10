'use strict';

module.exports = {
	method : "all",
	url : ["8"],
	desc : "all others : http404 ",
	passport : null,
	handler : function(req, res){
		res.status(404);
		if (req.xhr) {
			res.send({ error: 'Resource not found.' });
		}
		else {
			res.render('http/404');
		}
	}
};