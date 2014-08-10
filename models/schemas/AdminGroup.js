'use strict';

exports = module.exports = function(app, mongoose) {


	this.modelName = "AdminGroup";
	this.modelDesc = "Handles AdminGroups | _id | name | permissions ";

  this.schema = new mongoose.Schema({
    _id: { type: String },
    name: { type: String, default: '' },
    permissions: [{ name: String, permit: Boolean }]
  });
  this.schema.plugin(require('../plugins/pagedFind'));
  this.schema.index({ name: 1 }, { unique: true });
  this.schema.set('autoIndex', (app.get('env') === 'development'));
  

  return this;
};
