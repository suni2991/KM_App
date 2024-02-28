const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  id: { type: Number },
  firstName: { type: String, require: true },
  lastName: { type: String, require: true },
  fullName: { type: String, require: true },
  contact: { type: Number },
  email: { type: String, unique: true},
  feedbacks:[{
    dateOfInduction: { type: Date },
    joiningDate: { type: Date },
    feedbackFor: { type: String },
    presenter: { type: String },
    question1: { type: Number },
    question2: { type: Number },
    question3: { type: Number },
    question4: { type: Number },
    question5: { type: Number },
    question6: { type: Number },
    comment: { type: String },
    feedbackStatus: { type: String, default: "Not yet Received" },
  }],
  topics: [
    {
      topic: { type: String },
      score: { type: Number, default: -1 },
      testCount: { type: Number, default: 0 },
      assessmentStatus: {type: String, default: "Not Yet Attempted"},
      inductionStatus: {type: String, default: "Not Received"},
      presenter:{type:String},
    }
  ],
  testCount: { type: Number },
  status: { type: String, default: "In Progress" },
  password: { type: String },
  confirmPassword: { type: String },
  role: { type: String, enum: ["Employee", "Admin", "Manager"], default: "Employee" },
  dateCreated: { type: Date, default: "" },
  createdAt: { type: Date },
  category: { type: String },
  mgrName: { type: String },
  mgrEmail: { type: String },
  result: { type: String },
  department: {type: String, default: 'Not Defined'},
  
});

employeeSchema.index({ email: 1, 'topics.topic': 1 }, { unique: true });

const Employee = mongoose.model('Employee', employeeSchema);
module.exports = Employee;
