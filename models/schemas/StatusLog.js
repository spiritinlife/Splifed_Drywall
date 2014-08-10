'use strict';

exports = module.exports = function(app, mongoose) {



  this.modelName = "StatusLog";
  this.modelDesc = "Handles StatusLogs | _id | name  | userCreated(id,name,time)  ref:user ";

  this.schema = new mongoose.Schema({
    id: { type: String, ref: 'Status' },
    name: { type: String, default: '' },
    userCreated: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      name: { type: String, default: '' },
      time: { type: Date, default: Date.now }
    }
  });
  
  return this;
};
