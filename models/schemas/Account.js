'use strict';

exports = module.exports = function(app, mongoose) {
  
  
  
  this.modelName = "Account";
  this.modelDesc = "Handles Regular accounts | ref: User | ref: Status";
 

  this.schema = new mongoose.Schema({
    user: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      name: { type: String, default: '' }
    },
    isVerified: { type: String, default: '' },
    verificationToken: { type: String, default: '' },
    name: {
      first: { type: String, default: '' },
      middle: { type: String, default: '' },
      last: { type: String, default: '' },
      full: { type: String, default: '' }
    },
    company: { type: String, default: '' },
    phone: { type: String, default: '' },
    zip: { type: String, default: '' },
    status: {
      id: { type: String, ref: 'Status' },
      name: { type: String, default: '' },
      userCreated: {
        id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        name: { type: String, default: '' },
        time: { type: Date, default: Date.now }
      }
    },
    statusLog: [mongoose.modelSchemas.StatusLog],
    notes: [mongoose.modelSchemas.Note],
    userCreated: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      name: { type: String, default: '' },
      time: { type: Date, default: Date.now }
    },
    search: [String]
  });
  this.schema.plugin(require('../plugins/pagedFind'));
  this.schema.index({ user: 1 });
  this.schema.index({ 'status.id': 1 });
  this.schema.index({ search: 1 });
  this.schema.set('autoIndex', (app.get('env') === 'development'));
  this.schema.modelName = "AccountSchema";
  this.schema.modelDesc = "Handles account spesific stuff"

  return this;
};
