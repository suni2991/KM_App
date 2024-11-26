const mongoose = require('mongoose');

const nominationSchema = new mongoose.Schema({
   mgrEmail: {type: String },
   mgrName: {type: String, default: 'Admin'},
   fullName: {type: String},
   email: {type: String},
   trainings:[{
      trainingName:{ type: String},
      date:{type: Date},
      trainingStatus:{type: String, default: "Initialized"},
      timeSlot:{type: String},
      mode: { type: String, enum: ["Online", "Offline"], default: "Online" },
   }]
});

nominationSchema.index({ email: 1, 'trainings.trainingName': 1 }, { unique: true });

const Nomination = mongoose.model('Nomination', nominationSchema);
module.exports = Nomination;
