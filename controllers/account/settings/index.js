'use strict';
var helpers = require('./helpers');

module.exports = {
	method : "GET",
	url : ["/account/settings/"],
	desc : "get : account settings init ",
	passport : null,
	handler : function(req, res, next){
		helpers.renderSettings(req, res, next, '');
	}
};
