'use strict';


module.exports = {
	method : "PUT",
	url : ["/admin/accounts/:id/user"],
	desc : "put :admin accounts id linkuser",
	passport : null,
	handler : function(req, res, next){
		var workflow = req.app.utility.workflow(req, res);

		workflow.on('validate', function() {
			if (!req.user.roles.admin.isMemberOf('root')) {
				workflow.outcome.errors.push('You may not link accounts to users.');
				return workflow.emit('response');
			}

			if (!req.body.newUsername) {
				workflow.outcome.errfor.newUsername = 'required';
				return workflow.emit('response');
			}

			workflow.emit('verifyUser');
		});

		workflow.on('verifyUser', function(callback) {
			req.app.db.models.User.findOne({ username: req.body.newUsername }).exec(function(err, user) {
				if (err) {
					return workflow.emit('exception', err);
				}

				if (!user) {
					workflow.outcome.errors.push('User not found.');
					return workflow.emit('response');
				}
				else if (user.roles && user.roles.account && user.roles.account !== req.params.id) {
					workflow.outcome.errors.push('User is already linked to a different account.');
					return workflow.emit('response');
				}

				workflow.user = user;
				workflow.emit('duplicateLinkCheck');
			});
		});

		workflow.on('duplicateLinkCheck', function(callback) {
			req.app.db.models.Account.findOne({ 'user.id': workflow.user._id, _id: {$ne: req.params.id} }).exec(function(err, account) {
				if (err) {
					return workflow.emit('exception', err);
				}

				if (account) {
					workflow.outcome.errors.push('Another account is already linked to that user.');
					return workflow.emit('response');
				}

				workflow.emit('patchUser');
			});
		});

		workflow.on('patchUser', function() {
			req.app.db.models.User.findByIdAndUpdate(workflow.user._id, { 'roles.account': req.params.id }).exec(function(err, user) {
				if (err) {
					return workflow.emit('exception', err);
				}

				workflow.emit('patchAccount');
			});
		});

		workflow.on('patchAccount', function(callback) {
			req.app.db.models.Account.findByIdAndUpdate(req.params.id, { user: { id: workflow.user._id, name: workflow.user.username } }).exec(function(err, account) {
				if (err) {
					return workflow.emit('exception', err);
				}

				workflow.outcome.account = account;
				workflow.emit('response');
			});
		});

		workflow.emit('validate');
	}
};