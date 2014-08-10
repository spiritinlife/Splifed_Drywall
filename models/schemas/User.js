'use strict';

exports = module.exports = function(app, mongoose) {



  this.modelName = "User";
  this.modelDesc = "Handles Users ref:Account | ref: Admin ";

  this.schema = new mongoose.Schema({
    username: { type: String, unique: true },
    password: String,
    email: { type: String, unique: true },
    roles: {
      admin: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
      account: { type: mongoose.Schema.Types.ObjectId, ref: 'Account' }
    },
    isActive: String,
    timeCreated: { type: Date, default: Date.now },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    twitter: {},
    github: {},
    facebook: {},
    google: {},
    tumblr: {},
    search: [String]
  });
  this.schema.methods.canPlayRoleOf = function(role) {
    if (role === "admin" && this.roles.admin) {
      return true;
    }

    if (role === "account" && this.roles.account) {
      return true;
    }

    return false;
  };
  this.schema.methods.defaultReturnUrl = function() {
    var returnUrl = '/';
    if (this.canPlayRoleOf('account')) {
      returnUrl = '/account/';
    }

    if (this.canPlayRoleOf('admin')) {
      returnUrl = '/admin/';
    }

    return returnUrl;
  };
  this.schema.statics.encryptPassword = function(password, done) {
    var bcrypt = require('bcrypt');
    bcrypt.genSalt(10, function(err, salt) {
      if (err) {
        return done(err);
      }

      bcrypt.hash(password, salt, function(err, hash) {
        done(err, hash);
      });
    });
  };
  this.schema.statics.validatePassword = function(password, hash, done) {
    var bcrypt = require('bcrypt');
    bcrypt.compare(password, hash, function(err, res) {
      done(err, res);
    });
  };
  this.schema.plugin(require('../plugins/pagedFind'));
  this.schema.index({ username: 1 }, { unique: true });
  this.schema.index({ email: 1 }, { unique: true });
  this.schema.index({ timeCreated: 1 });
  this.schema.index({ 'twitter.id': 1 });
  this.schema.index({ 'github.id': 1 });
  this.schema.index({ 'facebook.id': 1 });
  this.schema.index({ 'google.id': 1 });
  this.schema.index({ search: 1 });
  this.schema.set('autoIndex', (app.get('env') === 'development'));

 return this;
};
