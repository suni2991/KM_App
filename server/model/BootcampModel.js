const mongoose = require('mongoose');

const bootcampSchema = new mongoose.Schema({
  mgrEmail: { type: String },
  mgrName: { type: String, default: 'Admin' },
  fullName: { type: String },
  email: { type: String },
  trainings: [
    {
      trainingName: { type: String },
      date: { type: Date },
      timeSlot: { type: String },
      trainingStatus: { type: String, default: 'Initialized' },
      subTrainings: [{ type: String }]
    },
  ],
});

// Add a unique compound index with a limit of 10 registrations per date and training topic combination
bootcampSchema.index({ email: 1, 'trainings.date': 1, 'trainings.trainingName': 1 }, { unique: true, partialFilterExpression: { 'trainings.trainingStatus': { $ne: 'Deleted' } }, collation: { locale: 'en', numericOrdering: true } });

const Bootcamp = mongoose.model('Bootcamp', bootcampSchema);
module.exports = Bootcamp;
