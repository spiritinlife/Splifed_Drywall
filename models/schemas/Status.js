'use strict';

exports = module.exports = function(app, mongoose) {


  this.modelName = "Status";
  this.modelDesc = "Handles Statuses | _id | pivot | name";


  this.schema = new mongoose.Schema({
    _id: { type: String },
    pivot: { type: String, default: '' },
    name: { type: String, default: '' }
  });
  this.schema.plugin(require('../plugins/pagedFind'));
  this.schema.index({ pivot: 1 });
  this.schema.index({ name: 1 });
  this.schema.set('autoIndex', (app.get('env') === 'development'));
  
  return this;
};
