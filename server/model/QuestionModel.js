const mongoose = require('mongoose');

const questionaireSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: { type: [String], required: true },
  correctAnswer: { type: Number, required: true },
  mark: { type: Number, required: true },
  createdAt:{type: Date},
  topic: { type: String, required: true },
});

const Questionaire= mongoose.model('Questionaire', questionaireSchema);

module.exports = Questionaire;
