const mongoose = require('mongoose');

// Define the schema for settings data
const settingsSchema = new mongoose.Schema({
  selectedOption: {
    type: String,
    enum: ['Manager', 'Presenter', 'Topic', 'Department'], // Enum for selected options
    required: true,
  },
  mgrName: {
    type: String,
    unique: true,
  },
  mgrEmail: {
    type: String,
    unique: true,
  },
  department: {
    type: String,
  },
  presenter: {
    type: String,
  },
  category: {
    type: String,
    enum: ['Assessment', 'Induction', 'Training', 'Bootcamp'],
  },
  topic: {
    type: String,
  },
  subtopics: [String],
});

// Pre-save hook to enforce uniqueness of topic within the same category
settingsSchema.pre('save', async function(next) {
  if (this.isModified('topic') || this.isModified('category')) {
    const existingTopic = await this.constructor.findOne({ topic: this.topic, category: this.category });
    if (existingTopic) {
      return next(new Error('Topic already exists in this category.'));
    }
  }
  next();
});

// Create the Settings model using the schema
const Settings = mongoose.model('Settings', settingsSchema);

module.exports = Settings;
