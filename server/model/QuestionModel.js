const mongoose = require('mongoose');

const questionaireSchema = new mongoose.Schema({
  question: { type: String, required: true },
  image:{type: String},
  options: { type: [String], required: true },
  correctAnswer: { type: Number, required: true },
  mark: { type: Number, required: true },
  createdAt:{type: Date},
  topic: { type: String, required: true },
  deleted: {type: Boolean, default: false}
});

const Questionaire= mongoose.model('Questionaire', questionaireSchema);

module.exports = Questionaire;
