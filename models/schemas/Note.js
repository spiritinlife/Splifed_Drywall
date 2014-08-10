'use strict';

exports = module.exports = function(app, mongoose) {



  this.modelName = "Note";
  this.modelDesc = "Handles Notes | data | userCreated(id,name,time)  ref:user";

  this.schema = new mongoose.Schema({
    data: { type: String, default: '' },
    userCreated: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      name: { type: String, default: '' },
      time: { type: Date, default: Date.now }
    }
  });

  return this;
};
