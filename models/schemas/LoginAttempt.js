'use strict';

exports = module.exports = function(app, mongoose) {


	this.modelName = "LoginAttempt";
	this.modelDesc = "Handles LoginAttempt | _id | user | time ";
  this.schema = new mongoose.Schema({
    ip: { type: String, default: '' },
    user: { type: String, default: '' },
    time: { type: Date, default: Date.now, expires: app.config.loginAttempts.logExpiration }
  });
  this.schema.index({ ip: 1 });
  this.schema.index({ user: 1 });
  this.schema.set('autoIndex', (app.get('env') === 'development'));
  

  return this;
};
