const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  questionType: { type: String, enum: ['text', 'multiple_choice', 'rating'], default: 'text' },
  options: [{ type: String }] // Used only if questionType is 'multiple_choice'
});

const feedbackFormSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  questions: [questionSchema],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("FeedbackForm", feedbackFormSchema);