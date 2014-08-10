'use strict';


module.exports = {
	method : "GET",
	url : ["/account/"],
	desc : "get : account init",
	passport : null,
	handler : function(req, res){
		res.render('account/index');
	}
};